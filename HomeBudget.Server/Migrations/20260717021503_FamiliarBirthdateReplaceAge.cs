using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBudget.Server.Migrations
{
    /// <inheritdoc />
    public partial class FamiliarBirthdateReplaceAge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Age",
                table: "Familiars");

            migrationBuilder.AddColumn<DateTime>(
                name: "Birthdate",
                table: "Familiars",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Birthdate",
                table: "Familiars");

            migrationBuilder.AddColumn<int>(
                name: "Age",
                table: "Familiars",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
