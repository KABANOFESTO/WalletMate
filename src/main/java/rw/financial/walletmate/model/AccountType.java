package rw.financial.walletmate.model;

/**
 * Represents the different types of accounts available in the WalletMate application.
 * This enum is used to categorize financial accounts and ensure consistency in account type naming.
 */
public enum AccountType {
    BANK("Bank Account"),
    MOBILE_MONEY("Mobile Money"),
    CASH("Cash"),
    SAVINGS("Savings Account"),
    INVESTMENT("Investment Account");

    private final String displayName;

    /**
     * Constructor for AccountType.
     *
     * @param displayName The user-friendly display name for the account type
     */
    AccountType(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Gets the user-friendly display name for the account type.
     *
     * @return A string representation suitable for display in the UI
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Finds an AccountType by its display name.
     *
     * @param displayName The display name to search for
     * @return The matching AccountType or null if not found
     */
    public static AccountType fromDisplayName(String displayName) {
        for (AccountType type : AccountType.values()) {
            if (type.getDisplayName().equalsIgnoreCase(displayName)) {
                return type;
            }
        }
        return null;
    }

    /**
     * Checks if the account type is a digital account (Bank or Mobile Money).
     *
     * @return true if the account is digital, false otherwise
     */
    public boolean isDigitalAccount() {
        return this == BANK || this == MOBILE_MONEY;
    }

    /**
     * Checks if the account type is an investment-related account.
     *
     * @return true if the account is investment-related, false otherwise
     */
    public boolean isInvestmentRelated() {
        return this == INVESTMENT || this == SAVINGS;
    }

    @Override
    public String toString() {
        return this.displayName;
    }
}