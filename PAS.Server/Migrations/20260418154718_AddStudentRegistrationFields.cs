using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PAS.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentRegistrationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Batch",
                table: "AppUsers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DegreeProgram",
                table: "AppUsers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DegreeType",
                table: "AppUsers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Faculty",
                table: "AppUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentId",
                table: "AppUsers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Batch",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "DegreeProgram",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "DegreeType",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "Faculty",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "AppUsers");
        }
    }
}
