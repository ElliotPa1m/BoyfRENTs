function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")
}

const money = (amount) => `${Number(amount).toFixed(2)} USD`

export function orderConfirmation(order) {
    const orderNumber = String(order._id)
    const shippingPrice = order.shippingPrice ?? 0

    const subject = `Order confirmation ${orderNumber}`

    const rows = order.items.map(item => `
        <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.quantity)}</td>
            <td>${money(item.price)}</td>
        </tr>`).join("")

    const shippingRow = shippingPrice > 0
        ? `<tr><td colspan="2">Shipping</td><td>${money(shippingPrice)}</td></tr>`
        : ""

    const html = `
        <h1>Thank you for your order, ${escapeHtml(order.customerName)}!</h1>
        <p>Order number: ${escapeHtml(orderNumber)}<br>E-mail: ${escapeHtml(order.customerEmail)}</p>
        <table cellpadding="6" cellspacing="0" border="1">
            <tr><th>Product</th><th>Hours</th><th>Price per hour</th></tr>
            ${rows}
            ${shippingRow}
            <tr><td colspan="2"><strong>Total</strong></td><td><strong>${money(order.totalPrice)}</strong></td></tr>
        </table>`

    const itemLines = order.items
        .map(item => `${item.name} x${item.quantity} - ${money(item.price)} per hour`)
        .join("\n")

    const text = [
        `Thank you for your order, ${order.customerName}!`,
        "",
        `Order number: ${orderNumber}`,
        `E-mail: ${order.customerEmail}`,
        "",
        itemLines,
        shippingPrice > 0 ? `Shipping: ${money(shippingPrice)}` : "",
        `Total: ${money(order.totalPrice)}`
    ].join("\n")

    return { subject, html, text }
}