# Issuing Verifiable Credentials

Now you know the basics of VS Agent set up and usage, it's time to learn about issuing Verifiable Credentials.

In this tutorial we'll explore the basics about Verifiable Credential definition and issuance.

### Requisites

To complete this tutorial, you will need any Linux/MacOS-based computer with:

- Docker
- NodeJS 18 or newer

### VS Agent set-up

To issue credentials, VS Agent setup is exactly the same as the previously seen [Minimal VS](./10-minimal-vs.md#making-your-vs-accessible). 

Let's run our issuer VS Agent:

```
docker run -p 3001:3001 -p 3000:3000 \
  -e AGENT_PUBLIC_DID=did:web:myhost.ngrok-free.app \
  -e EVENTS_BASE_URL=http://your-local-ip:4001 \
  -e AGENT_LABEL="My First Hologram VS" \
  -e AGENT_INVITATION_IMAGE_URL=https://hologram.zone/images/ico-hologram.png \  
  --name vs-agent io2060/vs-agent:dev

```


### Creating credential types

In order to issue credentials, we need to use a certain schema that defines how they are structured. VS Agent issues [AnonCreds](https://hyperledger.github.io/anoncreds-spec/) credentials, whose schemas (called **Credential Definitions**) are composed by name-value pairs called **attributes**.

VS Agent provides a simplified interface to create credential types. To create a new type, we can go to VS Agent's Swagger API site at http://localhost:3000/api and scroll to [**POST /v1/credential-types**](http://localhost:3000/api#/credential-types/CredentialTypesController_createCredentialType) method.


There we can try it out using the following request body: 

```json
{
  "name": "User",
  "version": "1.0",
  "attributes": [
    "firstName", "lastName", "phoneNumber"
  ]
}
```

This will ask VS Agent to create a type with a friendly name "User" with version "1.0" and containing three attributes: "firstName, "lastName" and phoneNumber".


VS Agent will respond with the following body:

```json
{
  "id": "did:web:myhost.ngrok-free.app?service=anoncreds&relativeRef=/credDef/Bs1u5uMio2EbcdYgpTYqXu1xPnGYaeZv1JswMN2VfoTi",
  "attributes": [
    "firstName",
    "lastName",
    "phoneNumber"
  ],
  "name": "User",
  "version": "1.0",
  "schemaId": "did:web:myhost.ngrok-free.app?service=anoncreds&relativeRef=/schema/ELNR8tNz535R8fc6EAw7SFpe2eokVyNCoAdQJgJ7jVnW"
}
```

Here it is important to write down the `id`, which is the **Credential Definition ID**. This is the identifier we'll need to use when referring to the credential type (note that `name` and `version` are used only for local query or user-friendlyness).


### Offering a Credential

It is possible to offer a credential in different ways. This time, we'll offer it to any user that scans a particular QR code. This is a typical case used when creating log-in credentials for a website when we have previously authenticated the user in another way (e.g. using a legacy username/password or system).

The process is quite simple: in Swagger interface, we scroll to [POST /v1/invitation/credential-offer](http://localhost:3000/api#/invitation/InvitationController_createCredentialOffer) method and offer a credential, of the type recently created, to John Smith whose phone number is +1333456789:

```json
{
  "credentialDefinitionId": "did:web:myhost.ngrok-free.app?service=anoncreds&relativeRef=/credDef/Bs1u5uMio2EbcdYgpTYqXu1xPnGYaeZv1JswMN2VfoTi",
  "claims": [
    {
      "name": "firstName",
      "value": "John"
    },
    {
      "name": "lastName",
      "value": "Smith"
    },
        {
      "name": "phoneNumber",
      "value": "+1333456789"
    }
  ]
}
```

This will create a response of the format:

```json
{
  "credentialExchangeId": "416b5d97-a572-41bc-a4d3-2152de303eba",
  "url": "https://hologram.zone/?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY2....am9pTWpNNVpHSXlNVFV0TnpNMU9DMDBNMlkzTFdKallUTXRaREJqT1dJME5UYzVabU0wSW4xOSJ9fV19",
  "shortUrl": "https://myhost.ngrok-free.app/s?id=a1a7b9dd-2fb1-4f0e-bbaf-588bfd3bedfc"
}
```

As you can see, it includes a long URL invitation code and also a short URL. You can either generate a QR code rendering the short URL or directly go to the short URL with a browser to make Hologram Zone render the short URL for you. This is a lot easier to read in low-end mobile phones.
