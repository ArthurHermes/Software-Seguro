import "./components/app-header.js";
import "./components/app-button.js";

const yearRef = document.querySelector("#current-year");
if (yearRef) {
  yearRef.textContent = String(new Date().getFullYear());
}
