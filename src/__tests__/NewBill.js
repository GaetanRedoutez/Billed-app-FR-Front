/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { bills } from "../fixtures/bills";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the new bill form should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("When I select a valid file, then store.bills().create is called", async () => {
      const onNavigate = jest.fn();

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const mockCreate = jest.spyOn(mockStore.bills(), "create");
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputFile = screen.getByTestId("file");

      const file = new File(["file content"], "test.jpg", {
        type: "image/jpeg",
      });

      fireEvent.change(inputFile, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalled();
        expect(newBillInstance.fileName).toBe("test.jpg");
      });
    });
  });
});
