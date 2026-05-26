# Security Notes

ModifierVault is a prototype for explicit user-owned AI memory. It is not a production privacy system.

## Payload Modes

`plaintext`

- Raw memory or reflection text is stored in the payload.
- Anyone who can read the entity can read the content.

`metadata-only`

- Raw content is omitted from the payload.
- Metadata, attributes, title, domain, content mode, keys, owner, creator, timestamps, and modifier attributes can still be public and queryable.

`encrypted`

- Raw content is encrypted locally with Web Crypto.
- The encrypted envelope is stored in payload.
- Metadata is not hidden.

## Metadata Is Still Visible

Encrypted payloads do not hide:

- `project`
- `schemaVersion`
- `entityType`
- `createdAt`
- `domain`
- `contentMode`
- `memoryKey`
- `modifierStackKey`
- `previousReflectionKey`
- `interpreter`
- `model`
- `lineageDepth`
- repeated modifier attributes
- owner and creator metadata returned by Arkiv

Do not put sensitive facts into titles, domains, modifier names, contexts, model names, or other queryable attributes.

## Browser And Passphrase Risks

Encryption and decryption happen in the browser. A compromised browser, extension, page script, clipboard, or device can expose plaintext or passphrases.

The app does not claim passphrase recovery. If the passphrase is lost, encrypted payloads cannot be decrypted by ModifierVault.

## Remote AI Risks

If a user decrypts a memory and asks a remote model to generate an `AgentReflection`, the decrypted memory is sent to that model provider. Remote AI calls can create provider-side logs, retention, or policy exposure depending on that provider.

## No Production Privacy Claims

This code demonstrates modeling boundaries and local encryption mechanics. It does not provide:

- audited cryptography
- key management
- forward secrecy
- secure enclave storage
- anonymity
- metadata privacy
- access-control guarantees beyond what Arkiv and the wallet provide

## Owner And Creator Visibility

Arkiv metadata can expose owner and creator addresses. This is useful for provenance and user ownership, but it is also public linkage. Treat wallet identity as visible metadata.

