# Hologram Verifiable Services

An **Hologram Service** is a decentralized, usually container-based service, that can be independently deployed in any datacenter, and that implements the [Verifiable Trust specification](https://verana-labs.github.io/verifiable-trust-spec/).

An HVS is uniquely identified by a [DID](https://www.w3.org/TR/did-1.0/), and it can authenticate itself to a peer by presenting verifiable credentials before any connection is initiated.

```plantuml
@startuml

object "Hologram Verifiable Service" as vsa #3fbdb6 {
    *Public DID
    *Linked-VP credentials
    *VC wallet
    *Keys
    +Crypto wallet
    +Connections
}
```

Peers wishing to connect to a VS can **review the verifiable credentials presented by the service**, verify their legitimacy through trust resolution, and **decide whether to proceed with the connection based on the outcome**.

A VS is also required to verify the trustworthiness of peers attempting to connect to it, whether those peers are other verifiable services (VS) or verifiable user agents (VUAs), and must reject connections from non-verifiable peers.

Furthermore, if a verifiable service wants to issue credentials or request credential presentation, **it must first prove that it is authorized to perform these actions**. Otherwise, the peer must refuse the request.

```plantuml
@startuml

[Verifiable Public Registry (VPR)] as VPR #D88AB3


package "Verifiable Service #1 (VS1)" as VS1  {
  [Service Agent] as VS1sa #3fbdb6
    [Trust Resolver] as VS1tr
    [Indexer] as VS1idx
    VS1sa --> VS1tr
    VS1sa --> VS1idx
}

interface VS3 #3fbdb6
interface VS4 #3fbdb6


VS1tr --> VPR
VS1tr --> VS3
VS1tr --> VS4

VS1idx --> VPR


@enduml

```

:::tip
All the verifications are performed by the VS by using the trust resolver. Indexer is used for service discovery.
:::

Examples of verifiable services include:

- chatbot services, such as services built for [Hologram Messaging](https://hologram.zone)
- decentralized social channels;
- etc...

## Hologram Verifiable User Agent (VUA)

A verifiable user agent (VUA) is software, such as a browser, app, or wallet, designed to connect with verifiable services (VS) and other VUAs. When establishing connections, a VUA must verify the identity and trustworthiness of its peers and allow connections only to compliant VS or VUA peers.

```plantuml
@startuml

object "Verifiable User Agent Instance" as hi1 #b99bce {
    *Keys
    *Connections
    +VC wallet
    +Crypto wallet
    
}
```

As part of this process, the verifiable user agent (VUA) must perform trust resolution by:

- Verifying the verifiable credentials presented by peers;

- Querying verifiable public registries (VPRs) to confirm that the credentials were issued by recognized and authorized issuers.

This ensures that all connections are established on the basis of verifiable trust, rather than assumptions.

In addition, VUAs can query an index (the DID directory, managed by the VPR - see below) that catalogs all known verifiable services (VSs), to search VSs compatible with the VUA or VSs that present a certain type of credential. This enables:

- users to search for and discover relevant services: for example, within a social browser VUA, a user could search for a social channel VS by querying the index for an influencer’s name.

- VUA vendors to require VSs to present a certain type of credential (free or paid) for being listed in the VUA, of for having specific features in the VUA (premium, etc).

```plantuml
@startuml

[Verifiable Public Registry (VPR)] as VPR #D88AB3


package "Verifiable Service #1 (VS1)" as VS1  {
  [Service Agent] as VS1sa #3fbdb6
    [Trust Resolver] as VS1tr
    [Indexer] as VS1idx
    VS1sa --> VS1tr
    VS1sa --> VS1idx
}

interface VS2 #3fbdb6
interface VS3 #3fbdb6
interface VS4 #3fbdb6


package "Verifiable User Agent (VUA)" as App1 {
    actor "User #1" as user1
actor "User #2" as user2
  [VUA Instance #1-1] as VUA11 #b99bce
  [VUA Instance #1-2] as VUA12 #b99bce
    [Trust Resolver] as VUAtr
    [Indexer] as VUAidx

}

VUAtr --> VS2

VUAtr --> VPR
VUAidx --> VPR

VS1tr --> VPR
VS1tr --> VS3
VS1tr --> VS4

VS1idx --> VPR


VUA12 --> VUAtr
VUA11 --> VUAtr
VUA12 --> VUAidx : queries
VUA11 --> VUAidx : queries

VUA12 <--> VUA11 : p2p

user1 ..> VUA11 : use
user2 ..> VUA12 : use

VUA12 -->  VS1sa

@enduml

```

[Hologram Messaging](https://hologram.zone), a chatbot and AI agent browser, is the **first known verifiable user agent**.

## Verifiable Public Registry (VPR)

### Trust Registries

A VPR is a **“registry of registries”**, a public, permissionless service that provides foundational infrastructure for decentralized trust ecosystems, as specified in the [Verifiable Public Registry (VPR) specification](https://verana-labs.github.io/verifiable-trust-vpr-spec/).

It is used by ecosystems that want to define credential schemas and who can issue or verify credentials of these schemas.

Purpose of a VPR is to answer these questions:

- is participant #1 **recognized** by ecosystem E1?
- can participant #1 **issue credential** for schema ABC of ecosystem E1?
- can participant #2 request **credential presentation** of credential issued by issuer DEF from schema GHI of ecosystem E2 in context CONTEXT?

[VPRs are detailed here](https://docs.verana.io/docs/next/learn/verifiable-public-registry/trust-registries)

### DID Directory

Added to trust registry features, the VPR provides a **DID directory**: a public database of [DIDs](https://www.w3.org/TR/did-1.0/). It allows crawlers and search engines to index metadata associated with **verifiable services (VSs)** provided by these DIDs.

## Build for decentralization

Connections between verifiable services (VSs) and/or verifiable user agents (VUAs) are fully decentralized and verifiable.

In the example below, we have two verifiable user agents #1 and #2 from different vendors. Instances of these compliant VUAs can establish connections with other instances, and with verifiable services from all organizations. Verifiable services can connect to other verifiable services.

```plantuml
@startuml

package "Verifiable Public Registry (VPR)" as VPR {
  [VPR Node #N1] as VPR1 #3fbdb6 
    [VPR Node #N2] as VPR2 #3fbdb6
    [VPR Node #Nn] as VPRn #3fbdb6

    VPR1 <--> VPR2
    VPR1 <--> VPRn
    VPR2 <--> VPRn
}

package "Verifiable Services (VSs)" as VSs {
  cloud "Hosting Organization #A" as hostingA #f0f0f0{
    interface [VS Instance #A1] as AVS1 #3fbdb6
    interface [VS Instance #A2] as AVS2 #3fbdb6
    interface [VS Instance #A3] as AVS3 #3fbdb6
    
    }

    cloud "Hosting Organization #B" as hostingB #f0f0f0 {
    interface [VS Instance #B1] as BVS1 #3fbdb6
    interface [VS Instance #B2] as BVS2 #3fbdb6
    
    }

    cloud "Hosting Person #C" as hostingC #f0f0f0 {
    interface [VS Instance #C1] as CVS1 #3fbdb6
    }
}

package "Verifiable User Agent (VUA) #1" as VUA1 {
    actor "User #1" as user1
actor "User #2" as user2
actor "User #n" as usern
  [VUA Instance #1-1] as VUA11 #b99bce
  [VUA Instance #1-2] as VUA12 #b99bce
  [VUA Instance #1-n] as VUA1n #b99bce

}

package "Verifiable User Agent (VUA) #2" as VUA2 {
    actor "User #4" as user4
actor "User #k" as userk
  [VUA Instance #2-1] as VUA21 #D88AB3
  [VUA Instance #2-n] as VUA2n #D88AB3
}


VUA1 --> VPR
VUA2 --> VPR
VSs --> VPR

VUA11 <--> AVS1 : p2p
VUA11 <--> BVS2 : p2p

VUA21 <--> AVS3 : p2p

VUA12 <--> AVS1 : p2p
VUA12 <--> CVS1 : p2p

VUA1n <--> AVS3 : p2p

VUA12 <--> VUA1n : p2p

VUA21 <--> VUA2n : p2p

user1 ..> VUA11 : use
user2 ..> VUA12 : use
usern ..> VUA1n : use
user4 ..> VUA21 : use
userk ..> VUA2n : use


VUA2n <--> VUA1n : p2p

VUA2n <--> CVS1 : p2p

BVS1 <--> CVS1 : p2p

@enduml

```

:::tip
Verifiable services can be hosted anywhere, based on service provider (organization, person) decision.
:::
