/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import VerticalLayout from "../views/VerticalLayout";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as Employee", () => {
  test("Then Icons should be rendered", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const user = JSON.stringify({ type: "Employee" });
    window.localStorage.setItem("user", user);
    const html = VerticalLayout(120);
    document.body.innerHTML = html;
    expect(screen.getByTestId("icon-window")).toBeTruthy();
    expect(screen.getByTestId("icon-mail")).toBeTruthy();
    expect(screen.getByTestId("layout-disconnect")).toBeTruthy();
  });
});

describe("Given I am connected as non-Employee", () => {
  test("Then only disconnect icon should be rendered", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const user = JSON.stringify({ type: "Manager" });
    window.localStorage.setItem("user", user);

    const html = VerticalLayout(120);
    document.body.innerHTML = html;

    expect(screen.queryByTestId("icon-window")).toBeNull();
    expect(screen.queryByTestId("icon-mail")).toBeNull();
    expect(screen.getByTestId("layout-disconnect")).toBeTruthy();
  });
});

describe("Given there is no user in localStorage", () => {
  test("Then only disconnect icon should be rendered", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.removeItem("user");

    const html = VerticalLayout(120);
    document.body.innerHTML = html;

    expect(screen.queryByTestId("icon-window")).toBeNull();
    expect(screen.queryByTestId("icon-mail")).toBeNull();
    expect(screen.getByTestId("layout-disconnect")).toBeTruthy();
  });
});
