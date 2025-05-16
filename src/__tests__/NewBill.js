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
    test("Then should upload valid file and update instance", async () => {
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
    test("Then should alert and reset input on invalid file", async () => {
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

      const alertMock = jest
        .spyOn(window, "alert")
        .mockImplementation(() => {});

      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputFile = screen.getByTestId("file");

      const file = new File(["bad file extension"], "test.txt", {
        type: "text/plain",
      });

      fireEvent.change(inputFile, { target: { files: [file] } });

      expect(alertMock).toHaveBeenCalledWith(
        "Seuls les fichiers .jpg, .jpeg, .png sont autorisés."
      );

      expect(inputFile.value).toBe("");
    });
    test("Then should call updateBill with the correct bill", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      document.body.innerHTML = NewBillUI();

      const newBillInstance = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      const updateFn = jest.spyOn(newBillInstance, "updateBill");

      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "test" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "100" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2025-05-16" },
      });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "80" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "commentary" },
      });

      newBillInstance.fileUrl = "https://localhost/test.jpg";
      newBillInstance.fileName = "test.jpg";

      fireEvent.submit(screen.getByTestId("form-new-bill"));

      expect(updateFn).toHaveBeenCalledWith({
        email: JSON.parse(localStorage.getItem("user")).email,
        type: "Transports",
        name: "test",
        amount: 100,
        date: "2025-05-16",
        vat: "80",
        pct: 20,
        commentary: "commentary",
        fileUrl: "https://localhost/test.jpg",
        fileName: "test.jpg",
        status: "pending",
      });
    });
  });
});
