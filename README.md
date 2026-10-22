# ამქარი (Amqari)

AI Sales Agent for Instagram and Facebook Businesses

## Overview

Amqari is an AI-powered sales agent that helps small businesses automate customer conversations, verify inventory, apply pricing rules, and convert messages into orders.

The system is designed for businesses that currently manage orders manually through Instagram and Facebook messaging.

## Problem

Small businesses spend significant time:

- Answering repetitive questions
- Checking stock manually
- Negotiating prices
- Managing orders through DMs

This leads to slow response times and operational mistakes.

## Proposed Solution

Amqari receives customer messages and:

- Identifies customer intent
- Extracts products and order details
- Checks business data
- Applies pricing rules
- Drafts responses
- Escalates sensitive decisions for approval
- Creates verified orders

## Current Progress

### ✅ Completed

- Product architecture
- Meta Developer App setup
- Instagram Professional Account integration
- Instagram Tester setup
- Access token generation
- System design
- Database design planning
- Agent workflow design

### 🚧 In Progress

- Meta webhook configuration
- Instagram message ingestion
- LangGraph workflow implementation
- Inventory tools
- Order management backend

### 🔮 Planned

- Human approval workflow
- Evaluation dashboard
- Performance testing
- Facebook Messenger integration
- Deployment

## Planned Architecture

Instagram/Facebook
→ Meta Webhooks
→ FastAPI Backend
→ LangGraph Agent
→ Business Rules Engine
→ SQLite/PostgreSQL
→ Order Processing

## Tech Stack

- Python
- FastAPI
- LangGraph
- SQLite
- Meta Instagram API
- Streamlit
- Docker

## Vision

Create a trustworthy AI sales agent that helps Georgian businesses automate customer communication while maintaining full control over pricing, inventory, and ordering decisions.
