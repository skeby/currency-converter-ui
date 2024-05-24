// const NODE_ENV = "production";
const NODE_ENV = "development";
const API_BASE_URL =
  NODE_ENV === "development"
    ? "http://localhost:3000/api"
    : "https://currency-converter-api-skeby.vercel.app/api";
const CURRENCY_API_BASE_URL = "https://api.currencyapi.com/v3/latest";
// const CURRENCY_API_KEY = "cur_live_LStHL49w6UlmsQf1fGQj10Rz7lsTNNmRHxB9PYhf";
const CURRENCY_API_KEY = "cur_live_nwoLuu7lpyDGmOBfSvOQvJpfalA4tqZszdD0SdxW";

const getConversionRate = (sourceCurrency, targetCurrency) => {
  return fetch(
    `${CURRENCY_API_BASE_URL}?currencies=${targetCurrency}&base_currency=${sourceCurrency}`,
    {
      headers: {
        apiKey: CURRENCY_API_KEY,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.data[targetCurrency].value);
};

const getConversionHistory = () => {
  return fetch(`${API_BASE_URL}/conversions`)
    .then((res) => res.json())
    .then((data) => data);
};

const postConversion = (conversion) => {
  return fetch(`${API_BASE_URL}/conversions/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversion),
  });
};

const deleteConversionHistory = () => {
  return fetch(`${API_BASE_URL}/conversions`, {
    method: "DELETE",
  });
};

export {
  getConversionRate,
  getConversionHistory,
  postConversion,
  deleteConversionHistory,
};
