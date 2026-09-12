import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkles } from "lucide-react";
import StatCard from "./StatCard";

describe("StatCard Component", () => {
  it("renders label and value correctly", () => {
    render(<StatCard label="Total Words" value="120" icon={Sparkles} />);

    expect(screen.getByText("Total Words")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });
});
