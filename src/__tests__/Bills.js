/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("Then clicking on 'New Bill' button should navigate to NewBill page", async () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = `<button data-testid="btn-new-bill">New</button>`;

      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const newBillBtn = screen.getByTestId("btn-new-bill");
      userEvent.click(newBillBtn);

      expect(onNavigate).toHaveBeenCalledWith("#employee/bill/new");
    });
    test("Then clicking on the icon eye, a modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = null;
      const bill = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();

      const eyeIcons = screen.getAllByTestId("icon-eye");
      const firstIcon = eyeIcons[0];

      const expectedUrl = firstIcon.getAttribute("data-bill-url");

      bill.handleClickIconEye(firstIcon);

      expect($.fn.modal).toHaveBeenCalledWith("show");

      const img = document.querySelector(".bill-proof-container img");

      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe(expectedUrl);
      expect(img.getAttribute("alt")).toBe("Bill");
    });
  });
});
