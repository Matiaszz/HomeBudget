using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBudget.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRunningBalanceFromDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastExpenseRegister",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "LastIncomeRegister",
                table: "Transactions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "LastExpenseRegister",
                table: "Transactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "LastIncomeRegister",
                table: "Transactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }
    }
}
