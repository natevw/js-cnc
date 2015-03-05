# js-cnc

[early stage of development]

CNC controller interface (and supporting logic) written in JS because…it's what I had laying around?


## Features

At the moment most of these are *desired* features, not yet implemented.

- smooth jog control via ordinary G-code (proof-of-concept working!)
- nearly-automatic tool change and probing/edgefinding support
- machine and work coordinate system management
- scaling and feedrate/spindle overrides
- toolpath preview [this seems like such a separation of concerns, 
- [freehand sketching](https://github.com/natevw/metakaolin) of motion to be played back?
- remote library/file browser for selecting G-code from a shared folder/database (see architecture notes below for use cases)

## Architecture

Right now this is just a jumble of code roughly divided into a "client" file and a "server" file. However, I think a better division of labor would be something like:

- interface: directs the engine's operation based on user input
- engine: processes G-code and other interface commands vs. controller state
- driver: handles raw communication with the controller, e.g. over a USB port
- controller: the "CNC itself", i.e. the Grbl or similar board that does the actual work

I imagine the engine is where the "heavy lifting" should end up. By separating the interface from this, and by separating this from the driver, we would allow — latency permitting — various combinations. Perhaps the interface and driver would be hosted on an original Raspberry Pi, reserving its processor for rendering the UI by offloading any significat G-code processing to a faster machine elsewhere on the premises. Or the engine and driver could both be on a Pi next to the machine, with the operator using their phone or an old tablet/eReader as the interface.

