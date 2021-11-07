FROM mcr.microsoft.com/dotnet/sdk:3.1-alpine AS build

WORKDIR /source

COPY . .

ENV CXXFLAGS="--std=c++11"

RUN apk add g++ make python2 npm
RUN npm install
RUN ./node_modules/gulp/bin/gulp.js produce
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:3.1-alpine AS runtime

COPY --from=build /app /app/bin
COPY --from=build /source/node_modules /app/node_modules

WORKDIR /app/bin

EXPOSE 80

CMD ["dotnet", "Kolan.dll"]
