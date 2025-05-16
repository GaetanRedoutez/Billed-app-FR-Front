/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { bills } from "../fixtures/bills";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/Store", () => mockStore);

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

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const tableRows = screen.getAllByTestId("icon-eye");
      expect(tableRows.length).toBeGreaterThan(0);
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
      });

      test("fails with 404 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => Promise.reject(new Error("Erreur 404")),
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fails with 500 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => Promise.reject(new Error("Erreur 500")),
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
