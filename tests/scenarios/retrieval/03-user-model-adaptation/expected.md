# Expected behavior WITH distill

## The key test: does it adapt to a senior engineer?

Asking "explain DI in Spring Boot" to a senior Kotlin/Spring engineer
should produce a VERY different response than to a beginner.

## WITH distill must:
- Be SHORT (the user knows DI — they probably want a specific nuance)
- Skip basics entirely (no "DI means..." or "Spring uses IoC...")
- Jump to non-obvious insights: proxy behavior, lazy init, circular deps, profile-scoped beans
- Maybe ask what specific aspect they need (shows it knows they know the basics)
- No filler phrases ("Great question!", "Let me explain...")

## WITHOUT distill, likely produces:
- Long tutorial-style explanation
- Starts with "Dependency Injection is a design pattern..."
- Explains @Autowired, @Component, @Service basics
- Multiple paragraphs of introductory material
- Treats user as a beginner by default

## Scoring focus:
- Length difference (WITH should be 2-5x shorter)
- Depth (WITH = advanced internals, WITHOUT = intro level)
- Tone (WITH = peer conversation, WITHOUT = teacher mode)
