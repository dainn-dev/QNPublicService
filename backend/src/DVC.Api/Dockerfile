FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY DVC.sln .
COPY src/DVC.Domain/DVC.Domain.csproj src/DVC.Domain/
COPY src/DVC.Application/DVC.Application.csproj src/DVC.Application/
COPY src/DVC.Infrastructure/DVC.Infrastructure.csproj src/DVC.Infrastructure/
COPY src/DVC.Api/DVC.Api.csproj src/DVC.Api/
COPY tests/DVC.Tests/DVC.Tests.csproj tests/DVC.Tests/

RUN dotnet restore src/DVC.Api/DVC.Api.csproj

COPY . .

RUN dotnet publish src/DVC.Api/DVC.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "DVC.Api.dll"]
