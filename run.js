#!/usr/bin/env bun
import discord from "./discord/build";
import env from "./.gizli.toml";

console.log(await discord.deployToCf(env));
