const API_BASE_URL = "http://localhost:3000/api";
const CURRENCY_API_BASE_URL = "https://api.currencyapi.com/v3/latest";
const CURRENCY_API_KEY = "cur_live_LStHL49w6UlmsQf1fGQj10Rz7lsTNNmRHxB9PYhf";

const getConversionRate = (sourceCurrency, targetCurrency) => {
  return fetch(`${CURRENCY_API_BASE_URL}`, {
    headers: {
      apiKey: CURRENCY_API_KEY,
      currencies: targetCurrency,
      base_currency: sourceCurrency,
    },
  })
    .then((res) => res.json())
    .then((data) => data.data[targetCurrency].value);
};

const getConversionHistory = () => {
  return fetch(`${API_BASE_URL}/history`)
    .then((res) => res.json())
    .then((data) => data);
};

const postConversion = (conversionObj) => {
  return fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversionObj),
  });
};

const deleteConversionHistory = () => {
  return fetch(`${API_BASE_URL}/delete-history`, {
    method: "DELETE",
  });
};

export {
  getConversionRate,
  getConversionHistory,
  postConversion,
  deleteConversionHistory,
};
