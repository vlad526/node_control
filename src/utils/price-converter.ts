export const convertPrices = (
    price: number,
    currency: string,
    rates: { [key: string]: number } // курс до UAH
) => {
    const priceUAH = currency === 'UAH' ? price : price * rates[currency];

    return {
        USD: currency === 'USD' ? price : priceUAH / rates['USD'],
        EUR: currency === 'EUR' ? price : priceUAH / rates['EUR'],
        UAH: priceUAH,
    };
};