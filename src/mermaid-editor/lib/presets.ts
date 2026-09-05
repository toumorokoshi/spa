export interface DiagramPreset {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export const DIAGRAM_PRESETS: readonly DiagramPreset[] = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    code: `---
config:
  flowchart:
    rankSpacing: 1
    nodeSpacing: 1
---
graph TD
    A[Start] --> B{Is it ready?}
    B -- Yes --> C[Deploy]
    B -- No --> D[Work on it]
    D --> B
    C --> E[End]`
  },
  {
    id: 'sequence',
    name: 'Sequence Diagram',
    code: `sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant Server
    User->>Browser: Click Button
    Browser->>Server: POST /api/diagram
    Server-->>Browser: 200 OK (SVG)
    Browser-->>User: Render Diagram`
  },
  {
    id: 'classDiagram',
    name: 'Class Diagram',
    code: `classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +bark()
    }
    class Cat {
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`
  },
  {
    id: 'stateDiagram',
    name: 'State Diagram',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Submit
    Processing --> Success: Done
    Processing --> Error: Failure
    Error --> Idle: Retry
    Success --> [*]`
  },
  {
    id: 'gitGraph',
    name: 'Git Graph',
    code: `gitGraph
    commit
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit`
  },
  {
    id: 'erDiagram',
    name: 'Entity Relationship',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`
  }
];

export const DEFAULT_DIAGRAM_CODE: string = DIAGRAM_PRESETS[0].code;

export const getPresetById = (id: string): DiagramPreset | undefined => {
  return DIAGRAM_PRESETS.find((preset) => preset.id === id);
};
