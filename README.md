# faction-game-backend
Backend for my faction game written in nodejs

## Units

| Unit | Gold Cost | Starting health | Damage | Upkeep |
| :----: | :---------: | :---------------: | :------: | :------: |
| Pioneer | 200 | 3 | 2 | 25 |
| Worker | 350 | 5 | 0 | 45 |
| Warrior | 700 | 6 | 3 | 90 |
| Miner | 850 | 6 | 2 | 90 |

### PIONEER
- TRAVEL
- CONQUER_NEUTRAL_TILE
- NEUTRALIZE_ENEMY_TILE
- GENERATE_GOLD
- ATTACK
- RETIRE
- IDLE

### WORKER
- TRAVEL
- CONQUER_NEUTRAL_TILE
- GENERATE_GOLD
- FORTIFY
- RETIRE
- IDLE

### WARRIOR
- TRAVEL
- CONQUER_NEUTRAL_TILE
- NEUTRALIZE_ENEMY_TILE
- ATTACK
- PREPARE_DEFENSE
- RETIRE
- IDLE

### MINER
- TRAVEL
- ATTACK
- PREPARE_DEFENSE
- DEPLOY_MINE
- CLEAR_MINE
- RETIRE
- IDLE
