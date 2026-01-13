import { fireEvent, render, screen } from "@testing-library/react";
import DashboardPage from "@/app/page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("Home page navigation", () => {
  beforeEach(() => {
    pushMock.mockClear();
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("navigates to shopping check-in when a path option is clicked", () => {
    render(<DashboardPage />);

    const [zaraOption] = screen.getAllByRole("button", {
      name: /saw it and bought it in the moment/i,
    });
    fireEvent.click(zaraOption);

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      "/check-in/session_1700000000000_txn_001?txn=txn_001&path=impulse"
    );
  });

  it("navigates to food check-in when a guess is submitted", () => {
    render(<DashboardPage />);

    fireEvent.change(screen.getByPlaceholderText(/enter amount/i), { target: { value: "123" } });

    const submitButtons = screen.getAllByRole("button", { name: "→" });
    const enabledSubmit = submitButtons.find((b) => !b.hasAttribute("disabled"));
    if (!enabledSubmit) throw new Error("Expected an enabled submit button after entering a guess");
    fireEvent.click(enabledSubmit);

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      "/check-in/session_1700000000000_food?category=food&guess=123"
    );
  });
});


