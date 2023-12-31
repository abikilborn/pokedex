import {defineStore} from 'pinia'
import {orderBy} from "lodash";
const pokemonGenLimitAndOffset = {
    1: 'limit=151',
    2: 'limit=100&offset=152',
    3: 'limit=135&offset=251',
    4: 'limit=107&offset=386',
    5: 'limit=155&offset=494',
    6: 'limit=72&offset=649',
    7: 'limit=86&offset=721',
    8: 'limit=96&offset=809',
    9: 'limit=110&offset=905',
}

export const usePokemonStore = defineStore('pokemon', {
    persist: true,
    state: () => ({
        listOfPokemonByGeneration: {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            7: [],
            8: [],
            9: []
        }
    }),
    getters: {
        ninthGen: (state) => {
            return state.listOfPokemonByGeneration[9]
        },
        squareCount: (state) => {
            return state.count ** 2;
        },
    },
    actions: {
        async getPokemonByGeneration(generationNumber) {
            this.listOfPokemon = []
            const generation = pokemonGenLimitAndOffset[generationNumber]
            await fetch(`https://pokeapi.co/api/v2/pokemon?${generation}`).then((response) => {
                return response.json()
            }).then((data) => {
                this.formatPokemonList(generationNumber, data.results)
            })
        },
        formatPokemonList(generationNumber, pokemonList){
             pokemonList.forEach(async (pokemon) => {
                 const data = await this.getPokemonByName(pokemon.name)
                 const abilityDesc = await this.getPokemonAbilityDescription(data.abilities[0].ability.url)
                 const formattedData = {
                     id: data.id,
                     abilityTitle: (data.abilities[0].ability.name).replace('-', ' '),
                     abilityDesc: abilityDesc,
                     name: data.name,
                     sprite: data.sprites.front_default,
                     spriteBack: data.sprites.back_default,
                     stats: {
                         hp: data.stats[0].base_stat,
                         attack: data.stats[1].base_stat,
                         defense: data.stats[2].base_stat,
                         spAttack: data.stats[3].base_stat,
                         spDefense: data.stats[4].base_stat,
                         speed: data.stats[5].base_stat,
                     },
                     types: data.types,
                     height: data.height,
                     weight: data.weight,
                     speciesURL: data.species.url,
                     locationsURL: data.location_area_encounters,
                     locations: {},
                     species: {}
                 }
                await this.listOfPokemonByGeneration[generationNumber].push(formattedData)
            })
        },
        async getPokemonByName(name){
            return await fetch(
                `https://pokeapi.co/api/v2/pokemon/${name}`
            ).then(async (response) => {
                return await response.json()
            })
        },
        async getPokemonAbilityDescription(url){
            return await fetch(
                url
            ).then((response) => {
                return response.json()
            }).then((data) => {
                const englishEntry = data.effect_entries.filter((x) => { return x.language.name === 'en' })
                if(englishEntry[0]){
                    return englishEntry[0].short_effect
                } else {
                    return 'No further description available for this ability.'
                }

            })
        },
        async getLocationsByPokemon(generation, pokemon){
            const pokemonGen = this.listOfPokemonByGeneration[generation]
            const pokemonEntry = pokemonGen.find(o => o.id === pokemon.id)
            return await fetch(
                pokemon.locationsURL
            ).then((response) => {
                return response.json()
            }).then((data) => {
                if(data.length === 0){
                    console.log('emptee')
                    pokemonEntry.locations = { notCatchable: 'This Pokemon cannot be obtained in the wild.' }
                } else {
                    pokemonEntry.locations = data
                }
            })
        }
    },
})

