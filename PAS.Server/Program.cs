using Microsoft.EntityFrameworkCore;
using PAS.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Database Context (The Blueprint)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Add CORS Policy (Allows your React Vite app to talk to this API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Add Controllers
builder.Services.AddControllers();

// Add OpenAPI/Swagger (For testing your API visually)
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 4. Activate CORS (Must be placed before Auth!)
app.UseCors("AllowReactApp");

// 5. Serve static files FIRST (Images, CSS, JS)
// Moving this up allows public profile images to load instantly!
app.UseStaticFiles();

// 6. Activate Security (Role-Based Access Control)
app.UseAuthentication();
app.UseAuthorization();

// 7. Map the API Endpoints
app.MapControllers();

app.Run();