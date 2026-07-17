using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBudget.Server.Migrations
{
    /// <inheritdoc />
    public partial class CascadeDeleteFamiliar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Familiars_FamiliarId",
                table: "Transactions");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Familiars_FamiliarId",
                table: "Transactions",
                column: "FamiliarId",
                principalTable: "Familiars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Familiars_FamiliarId",
                table: "Transactions");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Familiars_FamiliarId",
                table: "Transactions",
                column: "FamiliarId",
                principalTable: "Familiars",
                principalColumn: "Id");
        }
    }
}
