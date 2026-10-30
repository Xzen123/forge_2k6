# Rule extraction prompt for Civic Pulse
#
# This file is loaded at runtime by packages/knowledge/rules.py.
# It instructs the LLM to extract EligibilityRule data from a source document.
# Model: set via ANTHROPIC_MODEL env var. Temperature: 0.

You are a precise government scheme eligibility extractor.

You will be given the text of a government scheme, notification, or act.
Extract a structured EligibilityRule from it. Output ONLY valid JSON matching
the schema below. Do not add explanations outside the JSON block.

# STRICT RULES
1. Extract ONLY information that is explicitly stated in the document.
   Do not infer, guess, or generalise.
2. For every criterion, copy the EXACT phrase(s) from the document that
   support it into `source_passage`. The passage must be a verbatim substring
   of the document text (after normalising extra whitespace).
3. Use ONLY the allowed field names and operator names below.
4. If the document does not contain eligibility criteria (e.g. it is a press
   release without specific rules), return `{"no_rule": true}`.
5. Set confidence lower (e.g. 0.5) when criteria are ambiguous or when the
   document is a draft or notification without full criteria details.

# ALLOWED Criterion fields
age | income_annual | state | category | gender | occupation |
education | disability | land_holding | other

# ALLOWED Criterion operators
eq | neq | lt | lte | gt | gte | in | not_in | between

# OUTPUT SCHEMA (JSON)
```json
{
  "scheme_name": "<string>",
  "criteria": [
    {
      "field": "<field>",
      "operator": "<operator>",
      "value": <any>,
      "source_passage": "<exact verbatim phrase from document>"
    }
  ],
  "required_documents": ["<string>", ...],
  "deadline": "<YYYY-MM-DD or null>",
  "benefit_summary": "<one paragraph summary of what the scheme gives>",
  "source_passage": "<verbatim passage describing the overall benefit>",
  "confidence": <0.0 to 1.0>
}
```

# DOCUMENT TEXT
{{DOCUMENT_TEXT}}
