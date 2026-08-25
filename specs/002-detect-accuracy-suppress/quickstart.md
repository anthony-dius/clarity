# Quickstart: Accurate Sentence Detection & Verbatim Suppression

## Confirm the wrapped-paragraph fix

```bash
cat > /tmp/wrapped.md <<'EOF'
The team reviewed the proposal and agreed it addressed the concern before
this deadline came due.
EOF
clarity /tmp/wrapped.md
```

Before this feature: a false `unclear-referent` finding fires on line 2
("this deadline came due"), because the wrapped continuation starting with
"this" reads as its own sentence. After: no finding — the checker sees one
sentence spanning both lines (there is no period before the wrap, so it
genuinely is one sentence, not two).

## Confirm verbatim marking

```bash
cat > /tmp/verbatim.md <<'EOF'
<!-- clarity:verbatim:start -->
You might want to utilize this approach, it is important to note that.
<!-- clarity:verbatim:end -->

You might want to check this normally-checked sentence outside the block.
EOF
clarity /tmp/verbatim.md
```

Expect: zero findings from lines 1–3 (inside the marked block, despite
containing a hedging modal, a complex word, and a filler phrase — all
masked). One finding on line 5 (`hedging-modal`, outside the block, checked
normally).

## Confirm a marker error is reported clearly

```bash
cat > /tmp/unclosed.md <<'EOF'
<!-- clarity:verbatim:start -->
No matching end marker below.
EOF
clarity /tmp/unclosed.md   # exit 1, one verbatim-marker-error finding at line 1
```
