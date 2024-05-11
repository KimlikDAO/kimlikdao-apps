# KimlikDAO blog

Welcome to the repository for the KimlikDAO blog. This blog is a central part of our communication,
where we provide

- developer updates on KimlikDAO and,
- run our Learn & Earn campaigns.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

Before setting up the project, ensure you have `git`, `bun` and `node` installed on your system. (`node` is needed only for Mina related articles.)

#### Cloning the Repository

To get started with the KimlikDAO Blog, clone the `kimlikdao-apps` repository and its submodules using:

```bash
git clone --recursive https://github.com/KimlikDAO/kimlikdao-apps
```

#### Installation

Navigate to the cloned repository and install the necessary dependencies:

```bash
cd kimlikdao-apps
bun i
```

#### Development server

From the `kimlikdao-apps` root, type

```bash
make blog.dev
```

and navigate to http://localhost:8787?en on your browser.

#### Canary server

From the `kimlikdao-apps` root, type

```bash
make blog.kanarya
```

and navigate to http://localhost:8787?en on your browser.

#### Deployment

To deploy on CloudFlare Workers platform, update `blog/sunucu/prod.toml` and run

```bash
make blog.cf-deployment
```
