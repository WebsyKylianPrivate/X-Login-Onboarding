# Ce que fait le videur (sémaphore) :
# Il laisse entrer seulement 12 personnes max.
# Les autres attendent dehors.
# Quand un client sort, le videur fait entrer le suivant.
import asyncio

sem = asyncio.Semaphore(3)  # max 3 tâches en même temps

async def job(n):
    async with sem:
        print(f"Start {n}")
        await asyncio.sleep(2)
        print(f"End {n}")

async def main():
    await asyncio.gather(*(job(i) for i in range(10)))

asyncio.run(main())