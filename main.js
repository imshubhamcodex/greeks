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
    document.getElementById('puts').colSpan = '10'
    document.getElementById('calls').colSpan = '10'

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
  const differenceMs = today - targetDate;
  const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

  return Number(differenceDays);
}

function feed_print(price, strike_price, ir, iv, days, type) {
  const S = price; // Underlying price
  const K = strike_price; // Strike price
  const r = ir; // Risk-free interest rate
  const sigma = iv; // Volatility
  const T_days = days; // Time to expiration (in days)
  const optionType = type; // 'call' or 'put'

  // console.log(price, strike_price, ir, iv, days, type);

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
    const greeks = calculateOptionGreeks(S, K, r, sigma, T_days, optionType);
    return greeks;
  }
}

// Function to calculate the cumulative distribution function of the standard normal distribution
function normCDF(x) {
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0) {
    const t = 1 / (1 + p * x);
    return (
      1 -
      c *
        Math.exp(-x * x / 2) *
        (t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5)))))
    );
  } else {
    return 1 - normCDF(-x);
  }
}

// Function to calculate option Greeks
function calculateOptionGreeks(S, K, r, sigma, T_days, optionType) {
  const T = T_days / 365; // Convert time to expiration to years
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const N_d1 = normCDF(d1);
  const N_d2 = normCDF(d2);

  const delta = optionType === "call" ? N_d1 : N_d1 - 1;
  const gamma =
    Math.exp(-0.5 * d1 ** 2) / (S * sigma * Math.sqrt(2 * Math.PI * T));
  const theta =
    (-(
      S *
      sigma *
      Math.exp(-0.5 * d1 ** 2) /
      (2 * Math.sqrt(2 * Math.PI * T))
    ) -
      r * K * Math.exp(-r * T) * N_d2) /
    365;
  const vega =
    S * Math.sqrt(T) * Math.exp(-0.5 * d1 ** 2) * 0.01 / Math.sqrt(2 * Math.PI);
  const rho =
    optionType === "call"
      ? K * T * Math.exp(-r * T) * N_d2 * 0.01
      : -K * T * Math.exp(-r * T) * normCDF(-d2) * 0.01;

  return {
    delta: delta.toFixed(5),
    gamma: gamma.toFixed(7),
    theta: theta.toFixed(2),
    vega: vega.toFixed(4),
    rho: rho.toFixed(5)
  };
}

document.getElementById("expirySelect").addEventListener("change", main)
