# Use the official .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TodoListApi.csproj", "."]
RUN dotnet restore "./TodoListApi.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "TodoListApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TodoListApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TodoListApi.dll"]
