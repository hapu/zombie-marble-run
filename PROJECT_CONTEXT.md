# Project Context

Keep under 800 words.

## Goal
Consolidate six prototype webpage games into a single-page browser game.

## Scope
- In: 2D Physics
- Out: 3D Graphics, non-free libraries

## Constraints
- Devices: Android phone + 4 GB Chromebook
- Budget: free tiers only unless approved

## Definition of done
- Free of bugs, polished look and feel, some form of multiplayer

## Current state
- Repo contains six analyzed prototypes (`One`, `Two`, `Four`, `Six`, `Seven`, `Eight`) plus a vanilla JS + canvas, vendored Rapier2D 0.21.0 (Apache-2.0) single-page implementation. The shared game has the Two-based race loop and flat-belt content. Physics and rendering are separated into independent modules, and `scripts/build-offline.py` creates a one-file offline build.
