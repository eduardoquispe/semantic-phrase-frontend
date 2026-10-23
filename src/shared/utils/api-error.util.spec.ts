import { describe, expect, it } from "vitest";
import { ApiErrorCode } from "../interfaces/problem-details.interface";
import {
  getErrorMessage,
  getFieldErrorMessage,
  getProblemDetails,
} from "./api-error.util";

function axiosErrorWith(data: unknown) {
  return { isAxiosError: true, response: { data } };
}

describe("getProblemDetails", () => {
  it("returns the response data for an axios error", () => {
    const data = { title: "Bad Request", status: 400, detail: "detail", code: ApiErrorCode.VALIDATION_ERROR };
    expect(getProblemDetails(axiosErrorWith(data))).toEqual(data);
  });

  it("returns undefined for a non-axios error", () => {
    expect(getProblemDetails(new Error("network error"))).toBeUndefined();
  });
});

describe("getErrorMessage", () => {
  it("returns the backend detail message", () => {
    const error = axiosErrorWith({
      title: "Internal Server Error",
      status: 500,
      detail: "Ocurrió un error en el servidor.",
      code: ApiErrorCode.INTERNAL_ERROR,
    });
    expect(getErrorMessage(error)).toBe("Ocurrió un error en el servidor.");
  });

  it("falls back to a generic message when there is no detail", () => {
    expect(getErrorMessage(new Error("network error"))).toBe(
      "Ocurrió un error. Inténtalo de nuevo.",
    );
  });
});

describe("getFieldErrorMessage", () => {
  it("returns the first message for the matching field", () => {
    const error = axiosErrorWith({
      title: "Bad Request",
      status: 400,
      detail: "Error de validación",
      code: ApiErrorCode.VALIDATION_ERROR,
      errors: [{ field: "text", messages: ["La frase es demasiado larga"] }],
    });
    expect(getFieldErrorMessage(error, "text")).toBe(
      "La frase es demasiado larga",
    );
  });

  it("returns undefined when the field has no error", () => {
    const error = axiosErrorWith({
      title: "Bad Request",
      status: 400,
      detail: "Error de validación",
      code: ApiErrorCode.VALIDATION_ERROR,
      errors: [{ field: "other", messages: ["otro error"] }],
    });
    expect(getFieldErrorMessage(error, "text")).toBeUndefined();
  });

  it("returns undefined when the error is not a validation error", () => {
    const error = axiosErrorWith({
      title: "Internal Server Error",
      status: 500,
      detail: "Error interno",
      code: ApiErrorCode.INTERNAL_ERROR,
    });
    expect(getFieldErrorMessage(error, "text")).toBeUndefined();
  });

  it("returns undefined when there is no error", () => {
    expect(getFieldErrorMessage(undefined, "text")).toBeUndefined();
  });
});
