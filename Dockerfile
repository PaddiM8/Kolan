FROM mcr.microsoft.com/dotnet/sdk:3.1-alpine AS build

WORKDIR /source

COPY . .

RUN apk add g++ make python2 npm
RUN npm install
RUN CXXFLAGS="--std=c++14" ./node_modules/gulp/bin/gulp.js produce
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:3.1-alpine AS runtime

WORKDIR /app/bin
COPY --from=build /app .

EXPOSE 80

CMD ["dotnet", "Kolan.dll"]
