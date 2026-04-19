using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PAS.Server.Migrations
{
    /// <inheritdoc />
    public partial class SyncSchemaPart1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SURGICAL HACK: Commented out to protect existing demo database schema

            // migrationBuilder.AddColumn<int>(
            //     name: "Marks",
            //     table: "Projects",
            //     type: "int",
            //     nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StudentId",
                table: "ProjectMembers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ProjectMembers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            // migrationBuilder.AddColumn<string>(
            //     name: "InviteStatus",
            //     table: "ProjectMembers",
            //     type: "nvarchar(max)",
            //     nullable: false,
            //     defaultValue: "");

            // migrationBuilder.AddColumn<int>(
            //     name: "UserId",
            //     table: "ProjectMembers",
            //     type: "int",
            //     nullable: true);

            // migrationBuilder.AddColumn<string>(
            //     name: "Bio",
            //     table: "AppUsers",
            //     type: "nvarchar(max)",
            //     nullable: true);

            // migrationBuilder.AddColumn<DateTime>(
            //     name: "CreatedAt",
            //     table: "AppUsers",
            //     type: "datetime2",
            //     nullable: false,
            //     defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            // migrationBuilder.AddColumn<string>(
            //     name: "ExpertiseCategories",
            //     table: "AppUsers",
            //     type: "nvarchar(max)",
            //     nullable: true);

            // migrationBuilder.AddColumn<string>(
            //     name: "ExpertiseDetails",
            //     table: "AppUsers",
            //     type: "nvarchar(max)",
            //     nullable: true);

            // migrationBuilder.AddColumn<string>(
            //     name: "FieldOfExpertise",
            //     table: "AppUsers",
            //     type: "nvarchar(max)",
            //     nullable: true);

            // migrationBuilder.AddColumn<bool>(
            //     name: "IsBanned",
            //     table: "AppUsers",
            //     type: "bit",
            //     nullable: false,
            //     defaultValue: false);

            // migrationBuilder.AddColumn<string>(
            //     name: "ProfilePicturePath",
            //     table: "AppUsers",
            //     type: "nvarchar(500)",
            //     maxLength: 500,
            //     nullable: true);

            // migrationBuilder.CreateTable(
            //     name: "GanttTasks",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         ProjectId = table.Column<int>(type: "int", nullable: false),
            //         TaskName = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         Progress = table.Column<int>(type: "int", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_GanttTasks", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_GanttTasks_Projects_ProjectId",
            //             column: x => x.ProjectId,
            //             principalTable: "Projects",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Messages",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         SenderId = table.Column<int>(type: "int", nullable: true),
            //         RecipientId = table.Column<int>(type: "int", nullable: false),
            //         Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         IsRead = table.Column<bool>(type: "bit", nullable: false),
            //         IsSystemNotification = table.Column<bool>(type: "bit", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Messages", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_Messages_AppUsers_RecipientId",
            //             column: x => x.RecipientId,
            //             principalTable: "AppUsers",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //         table.ForeignKey(
            //             name: "FK_Messages_AppUsers_SenderId",
            //             column: x => x.SenderId,
            //             principalTable: "AppUsers",
            //             principalColumn: "Id");
            //     });

            // migrationBuilder.CreateTable(
            //     name: "ProjectComments",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         ProjectId = table.Column<int>(type: "int", nullable: false),
            //         UserId = table.Column<int>(type: "int", nullable: false),
            //         Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_ProjectComments", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_ProjectComments_AppUsers_UserId",
            //             column: x => x.UserId,
            //             principalTable: "AppUsers",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //         table.ForeignKey(
            //             name: "FK_ProjectComments_Projects_ProjectId",
            //             column: x => x.ProjectId,
            //             principalTable: "Projects",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "ProjectGrades",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         ProjectId = table.Column<int>(type: "int", nullable: false),
            //         Marks = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            //         Feedback = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
            //         GradedBy = table.Column<int>(type: "int", nullable: false),
            //         GradedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_ProjectGrades", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_ProjectGrades_AppUsers_GradedBy",
            //             column: x => x.GradedBy,
            //             principalTable: "AppUsers",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //         table.ForeignKey(
            //             name: "FK_ProjectGrades_Projects_ProjectId",
            //             column: x => x.ProjectId,
            //             principalTable: "Projects",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Reports",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         ReporterId = table.Column<int>(type: "int", nullable: false),
            //         Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         AdminResponse = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         IsResolved = table.Column<bool>(type: "bit", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Reports", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_Reports_AppUsers_ReporterId",
            //             column: x => x.ReporterId,
            //             principalTable: "AppUsers",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            // migrationBuilder.CreateIndex(
            //     name: "IX_ProjectMembers_UserId",
            //     table: "ProjectMembers",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_GanttTasks_ProjectId",
            //     table: "GanttTasks",
            //     column: "ProjectId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Messages_RecipientId",
            //     table: "Messages",
            //     column: "RecipientId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Messages_SenderId",
            //     table: "Messages",
            //     column: "SenderId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_ProjectComments_ProjectId",
            //     table: "ProjectComments",
            //     column: "ProjectId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_ProjectComments_UserId",
            //     table: "ProjectComments",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_ProjectGrades_GradedBy",
            //     table: "ProjectGrades",
            //     column: "GradedBy");

            // migrationBuilder.CreateIndex(
            //     name: "IX_ProjectGrades_ProjectId",
            //     table: "ProjectGrades",
            //     column: "ProjectId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Reports_ReporterId",
            //     table: "Reports",
            //     column: "ReporterId");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_ProjectMembers_AppUsers_UserId",
            //     table: "ProjectMembers",
            //     column: "UserId",
            //     principalTable: "AppUsers",
            //     principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Left intact to allow rollbacks if needed in the future
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectMembers_AppUsers_UserId",
                table: "ProjectMembers");

            migrationBuilder.DropTable(
                name: "GanttTasks");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "ProjectComments");

            migrationBuilder.DropTable(
                name: "ProjectGrades");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_ProjectMembers_UserId",
                table: "ProjectMembers");

            migrationBuilder.DropColumn(
                name: "Marks",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "InviteStatus",
                table: "ProjectMembers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ProjectMembers");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "ExpertiseCategories",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "ExpertiseDetails",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "FieldOfExpertise",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "IsBanned",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "ProfilePicturePath",
                table: "AppUsers");

            migrationBuilder.AlterColumn<string>(
                name: "StudentId",
                table: "ProjectMembers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ProjectMembers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}