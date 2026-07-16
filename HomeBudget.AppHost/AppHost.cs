using System.ComponentModel;
using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);



var server = builder.AddProject<Projects.HomeBudget_Server>("server")
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();


var db = builder.AddPostgres("postgres");

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
