////////////////////////////
///////// Imports /////////
//////////////////////////
import currencyCodes from "./constants/currencyCodes.js";
import {
  getConversionRate,
  getConversionHistory,
  postConversion,
  deleteConversionHistory,
} from "./api/apiClient.js";

////////////////////////////
//// Element Selectors ////
//////////////////////////
const currencySelect = document.querySelectorAll(".currency-select");
const flags = document.querySelectorAll(".flag");
const convertBtn = document.getElementById("convert-btn");
const deleteHistoryBtn = document.getElementById("delete-history-btn");
const targetAmountDisplay = document.getElementById("target-amount");
const conversionHistoryTable = document.getElementById(
  "conversion-history-table"
);

////////////////////////////
// Variable Declarations //
//////////////////////////
let dateTime;
let sourceCurrency = "USD";
let targetCurrency = "USD";
let sourceAmount;
let targetAmount;
let currencies;

////////////////////////////
//// Functions/Methods ////
//////////////////////////
currencies = currencyCodes.map((code) => {
  return {
    code: code,
    flagPath: `https://wise.com/public-resources/assets/flags/rectangle/${code.toLowerCase()}.png`,
  };
});

const displayCurrencyOptions = (select) => {
  let html = "";
  currencies.forEach((currency) => {
    html +=
      currency.code === "USD"
        ? `<option value="${currency.code}" selected>${currency.code}</option>`
        : `<option value="${currency.code}">${currency.code}</option>`;
  });
  select.insertAdjacentHTML("beforeend", html);
};

const displayConversionHistory = () => {
  getConversionHistory()
    .then((data) => {
      // Handle the data
      let conversionHistory = data;
      if (conversionHistory.length === 0) {
        conversionHistoryTable.innerHTML = "<p>No recent conversions</p>";
      } else {
        displayConversionHistoryTable(conversionHistory);
      }
    })
    .catch((error) => {
      // Handle the error
      console.error("Error:", error);
    });
};

const displayConversionHistoryTable = (conversionHistory) => {
  conversionHistoryTable.innerHTML = `
    <thead>
      <th>Source</th>
      <th>Target</th>
      <th>Rate</th>
      <th>Date</th>
      <th>Time</th>
    </thead>
  `;

  conversionHistory.forEach((conversion) => {
    const dateTime = new Date(conversion.dateTime);
    const html = `
      <tr>
        <td>${conversion.sourceCurrency} ${conversion.sourceAmount.toFixed(
      2
    )}</td>
        <td>${conversion.targetCurrency} ${conversion.targetAmount.toFixed(
      2
    )}</td>
        <td>${(conversion.targetAmount / conversion.sourceAmount).toFixed(
          2
        )}</td>
        <td>${dateTime.toLocaleDateString("en-GB")}</td>
        <td>${dateTime.toLocaleTimeString()}</td>
      </tr>
    `;
    conversionHistoryTable.insertAdjacentHTML("afterbegin", html);
  });
};

currencySelect.forEach((select, i) => {
  displayCurrencyOptions(select);
  select.addEventListener("change", (e) => {
    const selectedCurrency = e.target.value;
    flags[i].src = currencies.find(
      (currency) => currency.code === selectedCurrency
    ).flagPath;
    sourceCurrency = currencySelect[0].value;
    targetCurrency = currencySelect[1].value;
  });
});

////////////////////////////
///// Event Listeners /////
//////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  displayConversionHistory();
});

convertBtn.addEventListener("click", () => {
  // Make sure table is visible
  // conversionHistoryTable.style.display = "table";

  // Get source amount
  sourceAmount = Number(document.getElementById("source-amount").value);
  if (!sourceAmount) {
    alert("Please enter a valid source amount");
    return;
  }

  // Get conversion rate
  getConversionRate(sourceCurrency, targetCurrency)
    .then((conversionRate) => {
      // Calculate target amount
      targetAmount = sourceAmount * conversionRate;

      // Create date time string (date and time of conversion)
      const date = new Date();
      dateTime = date.toISOString();

      // Display target amount
      targetAmountDisplay.value = targetAmount.toFixed(2);

      // Send conversion to backend
      postConversion({
        dateTime,
        sourceCurrency,
        targetCurrency,
        sourceAmount,
        targetAmount,
      })
        .then(() => {
          displayConversionHistory();
        })
        .catch((err) => console.error("An error occured: ", err));
    })
    .catch((err) => console.error("An error occured: ", err));
});

deleteHistoryBtn.addEventListener("click", () => {
  deleteConversionHistory()
    .then(() => {
      displayConversionHistory();
      alert("Conversion history deleted");
    })
    .catch((err) => console.error("An error occured: ", err));
});
