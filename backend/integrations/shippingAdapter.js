import { z } from "zod"

const SERVICE_POINTS_URL = "https://atapi2.postnord.com/rest/businesslocation/v5/servicepoints/nearest/byaddress"
const TRANSIT_TIME_URL = "https://atapi2.postnord.com/rest/transport/v2/transittime/addresstoaddress"
const TIMEOUT_MS = 5_000

// Bara fälten vi använder. Allt som kan saknas tillåts vara null.
const PostNordAnswer = z.object({
    servicePointInformationResponse: z.object({
        servicePoints: z.array(z.object({
            servicePointId: z.string().min(1),
            name: z.string().min(1),
            routeDistance: z.number().nullish(),
            visitingAddress: z.object({
                streetName: z.string().nullish(),
                streetNumber: z.string().nullish(),
                postalCode: z.string().nullish(),
                city: z.string().nullish()
            })
        }))
    })
})

export async function findServicePoints(postalCode) {
    if (!process.env.POSTNORD_API_KEY) {
        throw new Error("POSTNORD_API_KEY is missing in .env")
    }

    // Nyckeln ligger i adressen. Logga aldrig adressen.
    const params = new URLSearchParams({
        apikey: process.env.POSTNORD_API_KEY,
        returnType: "json",
        countryCode: "SE",
        agreementCountry: "SE",
        postalCode,
        numberOfServicePoints: "5",
        srId: "EPSG:4326",
        context: "optionalservicepoint",
        responseFilter: "public",
        typeId: "24,25,54",
        located: "all",
        whiteLabelName: "false"
    })

    let response
    try {
        response = await fetch(`${SERVICE_POINTS_URL}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    } catch (err) {
        throw new Error("Could not reach PostNord", { cause: err })
    }

    if (response.status === 400) {
        return []
    }

    if (!response.ok) {
        throw new Error(`PostNord answered ${response.status}`)
    }

    const parsed = PostNordAnswer.safeParse(await response.json())
    if (!parsed.success) {
        throw new Error(`Unexpected answer from PostNord: ${z.prettifyError(parsed.error)}`)
    }

    // PostNords format → shoppens format
    return parsed.data.servicePointInformationResponse.servicePoints.map(point => ({
        id: point.servicePointId,
        name: point.name,
        address: `${point.visitingAddress.streetName ?? ""} ${point.visitingAddress.streetNumber ?? ""}, ${point.visitingAddress.city ?? ""}`.trim(),
        distance: point.routeDistance ?? null
    }))
}

const TransitTimeAnswer = z.array(z.object({
    isSupported: z.boolean(),
    errorMessage: z.string().optional(),
    estimatedTimeOfArrival: z.object({
        timeOfArrival: z.string()
    }).optional(),
    service: z.object({
        basicServiceCode: z.string(),
        additionalServices: z.array(z.object({ additionalServiceCode: z.string() })).optional()
    })
}))

export async function getDeliveryEstimates(address, postalCode) {
    if (!process.env.POSTNORD_API_KEY || !process.env.SHOP_ADDRESS || !process.env.SHOP_POSTAL_CODE) {
        throw new Error("PostNord or shop address settings are missing in .env")
    }

    const startTime = new Date()
        .toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })
        .replace(" ", "T")
        .slice(0, 16)

    const params = new URLSearchParams({
        apikey: process.env.POSTNORD_API_KEY,
        startTime,
        originAddress: process.env.SHOP_ADDRESS,
        originPostalCode: process.env.SHOP_POSTAL_CODE,
        originCountryCode: "SE",
        destinationAddress: address,
        destinationPostalCode: postalCode,
        destinationCountryCode: "SE",
        showInternalAdditionalServiceCode: "false"
    })

    let response
    try {
        response = await fetch(`${TRANSIT_TIME_URL}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    } catch (err) {
        throw new Error("Could not reach PostNord", { cause: err })
    }

    if (response.status === 400) {
        return { home: null, servicePoint: null }
    }

    if (!response.ok) {
        throw new Error(`PostNord answered ${response.status}`)
    }

    const parsed = TransitTimeAnswer.safeParse(await response.json())
    if (!parsed.success) {
        throw new Error(`Unexpected answer from PostNord: ${z.prettifyError(parsed.error)}`)
    }

    const options = parsed.data
    const pick = (code) => options.find(item =>
        item.isSupported &&
        item.estimatedTimeOfArrival &&
        item.service.basicServiceCode === code &&
        !item.service.additionalServices?.length
    )

    return {
        home: pick("17")?.estimatedTimeOfArrival.timeOfArrival ?? null,
        servicePoint: pick("19")?.estimatedTimeOfArrival.timeOfArrival ?? null
    }
}