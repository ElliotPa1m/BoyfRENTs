import { createContext, useContext, useState, useEffect } from "react";
import { host } from "../src/variables"

const CurrencyContext = createContext()

export function CurrencyProvider({children}) {
    const [currency, setCurrency] = useState("USD")
    const [rates, setRates] = useState({})

    useEffect(() => {
        fetch(`${host}/api/currency/rates`)
        .then(res => {
            if (!res.ok) throw new Error("Something went wrong on the server")
            return res.json()
        })
        .then(data => setRates(data.rates || {}))
        .catch(err => console.error(err))
    }, [])

    const formatPrice = (usdAmount) => {
       
        if (!rates[currency]) {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD"
            }).format(usdAmount);
        }
    
        const convertedAmount = usdAmount * rates[currency];

        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency
        }).format(convertedAmount);
    };

    return (
        <CurrencyContext.Provider value={{currency, setCurrency, rates, formatPrice}}>
            {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => useContext(CurrencyContext)