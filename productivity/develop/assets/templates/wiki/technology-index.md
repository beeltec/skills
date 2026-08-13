# Technology Stack

Each technology contains only documents that apply to it. It can use any subset
of the standard documents and can add documents for other topics.

Documents in `general/` contain shared guidance. Each document states which
technologies it covers. Do not assume that every general document applies to
every technology.

# Shared Guidance

* [<Document title>](general/<document>.md) - <Topic and technologies in scope.>

# Technologies

## <Technology>

<Where and why it is used, and its version.>

* [Guidelines](<technology>/guidelines.md) - <Rules contributors must follow.>
* [<Additional document>](<technology>/<document>.md) - <What it covers.>

## <Technology>

<Where and why it is used, and its version.>

* [Best Practices](<technology>/best-practices.md) - <Recommended approaches and known pitfalls.>

# Standard Documents

Use only the documents that apply:

* `guidelines.md` - Rules contributors must follow.
* `best-practices.md` - Recommended approaches and known pitfalls.
* `examples.md` - Canonical implementations worth imitating.
* `api.md` - API contracts the technology exposes or consumes.

Add other documents when these choices do not fit. Use a descriptive kebab-case
filename and list every document under its technology above.

# Related

* [Architecture](/architecture.md)
* [Architecture Decisions](/adrs/index.md)
