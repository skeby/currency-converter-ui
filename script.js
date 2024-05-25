////////////////////////////
///////// Imports /////////
//////////////////////////
import currencyCodes from "./constants/currencyCodes.js";
import {
  getConversionRate,
  getConversionHistory,
  postConversion,
  deleteConversionHistory,
} from "./apiClient.js";

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
const conversionHistoryTableContainer = document.querySelector(
  ".conversion-history-table-container"
);
const tableLoader = document.querySelector("#table-loader");

////////////////////////////
// Variable Declarations //
//////////////////////////
let dateTime;
let sourceCurrency = "NGN";
let targetCurrency = "";
let sourceAmount;
let targetAmount;
let currencies;
let conversionHistory;

////////////////////////////
//// Functions/Methods ////
//////////////////////////
// Map the currency codes and flagpaths to the currencies array
currencies = currencyCodes.map((code) => {
  return {
    code: code,
    flagPath: `https://wise.com/public-resources/assets/flags/rectangle/${code.toLowerCase()}.png`,
  };
});

const displayCurrencyOptions = (select, selectType) => {
  let html =
    selectType === "target" ? "<option value='' selected></option>" : "";
  // Display each currency as an option in the select tag
  currencies.forEach((currency) => {
    html +=
      selectType === "source" && currency.code === "NGN"
        ? `<option value="${currency.code}" selected>${currency.code}</option>`
        : `<option value="${currency.code}">${currency.code}</option>`;
  });
  select.insertAdjacentHTML("beforeend", html);
};

const displayConversionHistory = () => {
  // Display the loader while the conversion history is being fetched
  if ((tableLoader.style.display = "none")) tableLoader.style.display = "flex";
  getConversionHistory()
    .then((data) => {
      // Handle the data
      conversionHistory = data;
      // Display "No recent conversions" if conversion history is empty, else display the conversion history table
      if (conversionHistory.length === 0) {
        conversionHistoryTable.innerHTML = "<p>No recent conversions</p>";
        conversionHistoryTable.classList.add("conversion-history__no-results");
      } else {
        conversionHistoryTable.classList.remove(
          "conversion-history__no-results"
        );
        displayConversionHistoryTable(conversionHistory);
      }
    })
    .catch((err) => {
      console.error("An error occured: ", err);
      alert("Something went wrong, please try again later");
    })
    .finally(() => {
      tableLoader.style.display = "none";
    });
};

const displayConversionHistoryTable = (conversionHistory) => {
  // Display the table heads of conversion history table
  conversionHistoryTable.innerHTML = `
    <thead>
      <th>Source</th>
      <th>Target</th>
      <th>Rate</th>
      <th>Date</th>
      <th>Time</th>
    </thead>
  `;

  // Display each cell of the table
  conversionHistory.forEach((conversion) => {
    // Create a new date object based on the dateTime property of the conversion
    const dateTime = new Date(conversion.dateTime);
    // Create template html string of the table rows + data
    const html = `
    <tr>
    <td>${conversion.sourceCurrency} ${parseFloat(
      conversion.sourceAmount
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}</td>
    <td>${conversion.targetCurrency} ${parseFloat(
      conversion.targetAmount
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}</td>
        <td>${parseFloat(
          conversion.targetAmount / conversion.sourceAmount
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
        <td>${dateTime.toLocaleDateString("en-GB")}</td>
        <td>${dateTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}</td>
      </tr>
    `;
    conversionHistoryTable.insertAdjacentHTML("afterbegin", html);
  });
};

const toggleButtonDisability = (button, disable) => {
  // Toggle the disability based on the condition passed as argument
  button.disabled = disable;
  button.classList.toggle("button-disabled");
};

currencySelect.forEach((select, i) => {
  // Display the currency options for each of the currency select tags
  displayCurrencyOptions(select, i === 0 ? "source" : "target");
  // Attach change event listeners to change the flag depending on the current value of the selected option
  select.addEventListener("change", (e) => {
    const selectedCurrency = e.target.value;

    const flagImage = currencies.find(
      (currency) => currency.code === selectedCurrency
    )?.flagPath;

    flags[i].src =
      selectedCurrency && flagImage ? flagImage : "/assets/image-not-found.jpg";

    flags[i].onerror = () => {
      flags[i].src = "/assets/image-not-found.jpg";
    };

    sourceCurrency = currencySelect[0].value;
    targetCurrency = currencySelect[1].value;
  });
});

////////////////////////////
///// Event Listeners /////
//////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  displayConversionHistory();
  document.getElementById("source-amount").focus();
});

convertBtn.addEventListener("click", () => {
  // Clear the target amount display
  targetAmountDisplay.value = "";
  // Disable the convert button
  toggleButtonDisability(convertBtn, true);
  // Get source amount
  sourceAmount = Number(document.getElementById("source-amount").value);

  // Display an error alert and re-enable the convert button if the source amount is undefined
  if (!sourceAmount) {
    alert("Please enter a valid source amount");
    toggleButtonDisability(convertBtn, false);
    convertBtn.classList.toggle(".loader");
    return;
  }

  if (!targetCurrency) {
    alert("Please select a target currency");
    toggleButtonDisability(convertBtn, false);
    convertBtn.classList.toggle(".loader");
    return;
  }

  if ((tableLoader.style.display = "none")) tableLoader.style.display = "flex";
  // Get conversion rate
  getConversionRate(sourceCurrency, targetCurrency)
    .then((conversionRate) => {
      // Calculate target amount
      targetAmount = sourceAmount * conversionRate;

      // Create date-time string (date and time of conversion) in ISO format
      const date = new Date();
      dateTime = date.toISOString();

      // Display target amount
      targetAmountDisplay.value = targetAmount.toFixed(2);

      // Post (send) conversion to backend
      postConversion({
        dateTime,
        sourceCurrency,
        targetCurrency,
        sourceAmount,
        targetAmount,
      })
        .then(() => {
          // Enable the convert button and display conversion history when the conversion has been posted to the backend
          convertBtn.classList.toggle(".loader");
          displayConversionHistory();
        })
        .catch((err) => {
          console.error("An error occured: ", err);
        });
    })
    .catch((err) => {
      console.error("An error occured: ", err);
      alert("Something went wrong, please try again later");
    })
    .finally(() => {
      toggleButtonDisability(convertBtn, false);
      tableLoader.style.display = "none";
    });
});

deleteHistoryBtn.addEventListener("click", () => {
  // Disable the delete history button
  toggleButtonDisability(deleteHistoryBtn, true);

  // Alert "no recent conversions" and enable delete history button if the conversion history is empty
  if (conversionHistory?.length === 0) {
    alert("No recent conversions to delete");
    toggleButtonDisability(deleteHistoryBtn, false);
    return;
  }

  if ((tableLoader.style.display = "none")) tableLoader.style.display = "flex";

  deleteConversionHistory()
    .then(() => {
      // Enable delete history button and display conversion history
      displayConversionHistory();
    })
    .catch((err) => {
      console.error("An error occured: ", err);
      alert("Something went wrong, please try again later");
    })
    .finally(() => {
      tableLoader.style.display = "none";
      toggleButtonDisability(deleteHistoryBtn, false);
    });
});
