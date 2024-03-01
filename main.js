chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  if (message.text === "go") {
    console.log("Activated");
    console.log("Made by shubhamcodex");
    main();
  }
}

function main() {
  // document.getElementsByClassName("refreshIcon")[0].click();

  setTimeout(() => {
    let data_table = document.getElementById("optionChainTable-indices");

    /* Removing other unimportant elements from headers*/
    let header = data_table.children[0].children[1];
    Array.from(header.children).forEach((e, i) => {
      if (
        i !== 1 &&
        i !== 2 &&
        i !== 3 &&
        i !== 4 &&
        i !== 5 &&
        i !== 6 &&
        i !== 7 &&
        i !== 8 &&
        i !== 9 &&
        i !== 11 &&
        i !== 12 &&
        i !== 13 &&
        i !== 14 &&
        i !== 15 &&
        i !== 16 &&
        i !== 21 &&
        i !== 20 &&
        i !== 19 &&
        i !== 18
      ) {
        header.removeChild(e);
      }

      if (i == 5 || i == 12) e.textContent = "Delta";
      if (i == 6 || i == 13) e.textContent = "Gamma";
      if (i == 7 || i == 14) e.textContent = "Theta";
      if (i == 8 || i == 15) e.textContent = "Vega";
      if (i == 9 || i == 16) e.textContent = "Roh";
    });

    data_table.children[0].children[0].innerHTML = `<th class="text-center" id="calls" colspan="4">CALLS</th>
        <th class="text-center" id="puts" colspan="5">PUTS</th>`;
    document.getElementsByClassName("container top_logomenu")[0].style.display =
      "none";
    document.getElementsByClassName(
      "container navlinks-container posrel"
    )[0].style.display =
      "none";
    window.scroll({ top: 230 });

    let price = Number(
      document
        .getElementById("equity_underlyingVal")
        .textContent.split(" ")[1]
        .replaceAll(",", "")
    );
    let roundStrike = price - price % 50 + 50;

    let body = data_table.children[1];
    let strikeIndex = 0;

    /* Getting latest strike price */
    Array.from(body.children).forEach((e, i) => {
      let testStrike = Number(
        e.children[11].children[0].textContent.replaceAll(",", "")
      );
      if (testStrike === roundStrike) {
        strikeIndex = i;
      }
    });

    /* Removing unimportant elements from main data table*/
    Array.from(body.children).forEach((e, i) => {
      if (i < strikeIndex - 14 || i > strikeIndex + 13) {
        body.removeChild(e);
      } else {
        Array.from(e.children).forEach((ele, j) => {
          if (
            j !== 1 &&
            j !== 2 &&
            j !== 3 &&
            j !== 4 &&
            j !== 5 &&
            j !== 6 &&
            j !== 7 &&
            j !== 8 &&
            j !== 9 &&
            j !== 11 &&
            j !== 12 &&
            j !== 13 &&
            j !== 14 &&
            j !== 15 &&
            j !== 16 &&
            j !== 21 &&
            j !== 20 &&
            j !== 19 &&
            j !== 18
          ) {
            e.removeChild(ele);
          }
        });
      }
    });
    document.getElementById("puts").colSpan = "10";
    document.getElementById("calls").colSpan = "10";

    // Adding hover effect and sentiments on each strike price
    let tableRowEle = document.getElementsByTagName("tr");
    Array.from(tableRowEle).forEach(e => {
      e.addEventListener("mouseover", function() {
        e.style.backgroundColor = "grey";
      });
      e.addEventListener("mouseout", function() {
        e.style.backgroundColor = "initial";
      });
    });

    Array.from(body.children).forEach((e, i) => {
      let ir = 10 / 100;
      let type = "call";
      let iv = "N/A";
      let date = document.getElementById("expirySelect").value;
      let days = find_date_diff(date);
      let strike_price = Number(e.children[9].textContent.replaceAll(",", ""));

      if (!isNaN(Number(e.children[3].textContent)))
        iv = Number(e.children[3].textContent);
      let greeks = feed_print(price, strike_price, ir, iv, days, type);

      e.children[4].textContent = greeks.delta;
      e.children[5].textContent = greeks.gamma;
      e.children[6].textContent = greeks.theta;
      e.children[7].textContent = greeks.vega;
      e.children[8].textContent = greeks.rho;
    });

    Array.from(body.children).forEach((e, i) => {
      let ir = 10 / 100;
      let type = "put";
      let iv = "N/A";
      let date = document.getElementById("expirySelect").value;
      let days = find_date_diff(date);
      let strike_price = Number(e.children[9].textContent.replaceAll(",", ""));

      if (!isNaN(Number(e.children[15].textContent)))
        iv = Number(e.children[15].textContent);
      let greeks = feed_print(price, strike_price, ir, iv, days, type);

      e.children[10].textContent = greeks.delta;
      e.children[11].textContent = greeks.gamma;
      e.children[12].textContent = greeks.theta;
      e.children[13].textContent = greeks.vega;
      e.children[14].textContent = greeks.rho;
    });
  }, 1000 * 3);
}

function find_date_diff(date) {
  const today = new Date();
  const targetDate = new Date(date);
  const differenceMs = Math.abs(today - targetDate);
  const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

  return Number(differenceDays);
}

function feed_print(price, strike_price, ir, iv, days, type) {
  const option = type; // "call" or "put"
  const underlyingPrice = price; // Current price of the underlying asset
  const strikePrice = strike_price; // Strike price of the option
  const timeToExpiration = days / 360; // Time to expiration in years
  const riskFreeRate = ir; // Risk-free interest rate
  const volatility = iv / 100; // Volatility of the underlying asset

  // Calculate option Greeks
  if (iv === "N/A") {
    // console.log("IV is N/A");
    return {
      delta: "N/A",
      gamma: "N/A",
      theta: "N/A",
      vega: "N/A",
      rho: "N/A"
    };
  } else {
    const greeks = blackScholes(
      option,
      underlyingPrice,
      strikePrice,
      timeToExpiration,
      riskFreeRate,
      volatility
    );
    return greeks;
  }
}

// Black-Scholes option pricing model
function blackScholes(optionType, S, K, T, r, sigma) {
  const d1 =
    (Math.log(S / K) + (r + 0.5 * Math.pow(sigma, 2)) * T) /
    (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  if (optionType === "call") {
    const callPrice =
      S * cumulativeDistribution(d1) -
      K * Math.exp(-r * T) * cumulativeDistribution(d2);
    const delta = cumulativeDistribution(d1);
    const gamma = probabilityDensity(d1) / (S * sigma * Math.sqrt(T));
    const theta =
      -(S * probabilityDensity(d1) * sigma) / (2 * Math.sqrt(T)) -
      r * K * Math.exp(-r * T) * cumulativeDistribution(d2);
    const vega = S * Math.sqrt(T) * probabilityDensity(d1);
    const rho = K * T * Math.exp(-r * T) * cumulativeDistribution(d2);
    return {
      price: callPrice,
      delta: delta.toFixed(7),
      gamma: gamma.toFixed(7),
      theta: theta.toFixed(2),
      vega: vega.toFixed(3),
      rho: rho.toFixed(4)
    };
  } else if (optionType === "put") {
    const putPrice =
      K * Math.exp(-r * T) * cumulativeDistribution(-d2) -
      S * cumulativeDistribution(-d1);
    const delta = cumulativeDistribution(d1) - 1;
    const gamma = probabilityDensity(d1) / (S * sigma * Math.sqrt(T));
    const theta =
      -(S * probabilityDensity(d1) * sigma) / (2 * Math.sqrt(T)) +
      r * K * Math.exp(-r * T) * cumulativeDistribution(-d2);
    const vega = S * Math.sqrt(T) * probabilityDensity(d1);
    const rho = -K * T * Math.exp(-r * T) * cumulativeDistribution(-d2);
    return {
      price: putPrice,
      delta: delta.toFixed(6),
      gamma: gamma.toFixed(7),
      theta: theta.toFixed(2),
      vega: vega.toFixed(3),
      rho: rho.toFixed(4)
    };
  } else {
    throw new Error("Invalid option type");
  }
}

// Cumulative distribution function for standard normal distribution
function cumulativeDistribution(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) {
    return 1 - prob;
  }
  return prob;
}

// Probability density function for standard normal distribution
function probabilityDensity(x) {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

document.getElementById("expirySelect").addEventListener("change", main)
