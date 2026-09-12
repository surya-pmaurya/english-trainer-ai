import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Brand from "./Brand";

describe("Brand Component", () => {
  it("renders brand name linking to home", () => {
    render(
      <MemoryRouter>
        <Brand />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
    expect(screen.getByText(/English Trainer/i)).toBeInTheDocument();
  });
});
