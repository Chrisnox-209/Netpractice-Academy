# NetPractice Academy — NetPractice 42 Tutorial, Course and Practice Lab

<p align="center">
  <strong>Learn IPv4, subnetting, CIDR masks and routing before solving NetPractice.</strong><br>
  A local, visual and progressive learning website for 42 students starting from zero.
</p>

<p align="center">
  <a href="README.md">Français</a> ·
  <a href="README_EN.md"><strong>English</strong></a> ·
  <a href="README_ES.md">Español</a>
</p>

## What is NetPractice Academy?

**NetPractice** is a 42 networking project focused on IPv4 addressing, subnet masks, subnetting and routing. NetPractice Academy is an interactive **NetPractice tutorial for beginners** built to explain the reasoning behind the fields you fill in.

Instead of memorizing answers, you learn how to determine a network range, detect overlapping subnets, choose a gateway, read a routing table and verify both the forward and return packet paths.

> This is a community learning tool. It is not official, is not affiliated with 42 and does not replace the official NetPractice subject or resources.

## Main features

### Beginner-friendly networking course

The lessons cover:

- hosts, switches, routers and packets;
- IPv4 addresses and 32-bit representation;
- subnet masks and **CIDR notation**;
- `/24` through `/30` masks;
- network and broadcast addresses;
- usable host ranges;
- same-subnet checks;
- subnet overlap;
- default gateways;
- routing tables, next hops and `0.0.0.0/0`;
- a repeatable method for solving NetPractice-style exercises.

### Visual subnetting laboratory

The lab turns calculations into visual explanations:

- **Where does this IP fall?** — shows an IP inside its subnet range;
- **Binary mask viewer** — network bits vs host bits;
- **Subnet overlap visualizer** — displays the exact shared range;
- **Split a /24** — visual blocks from `/24` to `/30`;
- **Same network?** — visually compares two hosts;
- **Most specific mask** — shows which masks work and which one is optimal;
- **Packet path** — forward and return path through gateways;
- **Quick reference** — CIDR and full dotted-decimal masks.

| CIDR | Dotted-decimal mask | Block size | Usable hosts* |
|---|---|---:|---:|
| `/24` | `255.255.255.0` | 256 | 254 |
| `/25` | `255.255.255.128` | 128 | 126 |
| `/26` | `255.255.255.192` | 64 | 62 |
| `/27` | `255.255.255.224` | 32 | 30 |
| `/28` | `255.255.255.240` | 16 | 14 |
| `/29` | `255.255.255.248` | 8 | 6 |
| `/30` | `255.255.255.252` | 4 | 2 |

\*Using the classic IPv4 model commonly used in this type of exercise.

### 21 interactive practice exercises

Practice is divided into three difficulty groups:

- **Basics** — IPv4, masks, same LAN, gateways;
- **NetPractice** — static routes, default route, Internet, VLSM and overlap;
- **Complex / Boss** — multiple routers, multiple LANs, transit links, route aggregation, dense VLSM and forward/return routing.

The validator distinguishes between:

```text
✅ Valid configuration — expected answer
⚠️ Working configuration — different from the expected answer
```

This matters because multiple network configurations may be technically valid even when one is the most precise or efficient answer.

Masks can be entered as either:

```text
/25
```

or:

```text
255.255.255.128
```

## Languages

The site supports:

- French;
- English;
- Spanish.

Use the **FR / EN / ES** selector in the top bar. Your choice is saved locally in `localStorage`.

## Run locally

Requirements:

- `make`;
- Python 3;
- a modern web browser.

No npm dependencies, framework, Docker image or remote server is required.

```bash
make
```

The server starts and **automatically opens NetPractice Academy in your default browser**.

It first tries `http://localhost:49242`. If that port is already in use, the launcher automatically selects the next free port, opens the correct URL and also prints it in the terminal.

Custom starting port:

```bash
make PORT=8000
```

To start the server **without automatically opening a browser**:

```bash
make AUTO_OPEN=0
```

Run checks:

```bash
make check
```

## Recommended learning path

1. Read the **Lessons** in order.
2. Open the **Lab** whenever a concept feels abstract.
3. Experiment with several masks instead of memorizing one answer.
4. Complete **Basics** practice.
5. Move to **NetPractice** scenarios.
6. Finish with **Complex / Boss** networks.
7. On routing errors, always trace the packet in both directions.

## Quick subnet overlap example

```text
Network A: 192.168.1.0/25
→ 192.168.1.0 to 192.168.1.127

Network B: 192.168.1.64/26
→ 192.168.1.64 to 192.168.1.127
```

The `.64` to `.127` range belongs to both networks, so they overlap.

A valid layout is:

```text
Network A: 192.168.1.0/25
→ .0 to .127

Network B: 192.168.1.128/26
→ .128 to .191
```

The built-in overlap visualizer lets you edit the values and see the conflict directly.

## Project structure

```text
.
├── Makefile
├── README.md
├── README_EN.md
├── README_ES.md
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── network.js
│       ├── courses.js
│       ├── levels.js
│       ├── i18n.js
│       └── app.js
├── tools/serve.py
└── tests/smoke_test.py
```

Everything runs locally in the browser.

## FAQ

### Is this an answer sheet for the official NetPractice levels?

No. It is a learning environment for the networking concepts and problem-solving patterns required by NetPractice. The goal is understanding, not memorizing a list of official answers.

### How do I know whether two IP addresses are on the same subnet?

Apply the same subnet mask to both addresses and compare their **network addresses**. If the resulting network address is identical, they are on the same subnet for that mask.

### Why can `/25` work when `/26` is the expected answer?

A larger subnet may still contain both hosts. `/26` can be the most specific valid network, while `/25` is functional but reserves more addresses. The trainer explicitly explains this difference.

### Why is the return route important?

Reaching the destination is only half the communication. The remote side also needs a valid route back to the source.

## GitHub discoverability

Suggested repository description:

> Interactive NetPractice 42 tutorial: IPv4, subnetting, CIDR, routing, visual labs and 21 practice exercises for beginners.

Suggested GitHub topics:

```text
42
42-school
netpractice
netpractice-42
ipv4
subnetting
cidr
networking
routing
subnet-mask
computer-networks
network-learning
```

These naturally match searches such as **NetPractice 42 tutorial**, **NetPractice guide**, **learn subnetting**, **CIDR calculator**, **IPv4 subnet mask**, **routing table tutorial** and **default gateway**.

## Contributing

Educational fixes, visualizers and new practice scenarios are welcome. Keep three principles in mind:

1. explain before revealing the answer;
2. prefer a visual representation when it makes a concept easier to understand;
3. accept technically valid configurations and explain when a different answer is more precise.

## Other languages

- [README français](README.md)
- [English README](README_EN.md)
- [README en español](README_ES.md)

---

**Keywords:** NetPractice 42, NetPractice tutorial, NetPractice guide, IPv4, subnetting, CIDR, subnet mask, default gateway, routing table, VLSM, subnet overlap, computer networking, 42 school.
