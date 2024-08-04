
import { GenerativeAgent } from './SparkUser';
import { GenerativeAgentsUtils } from '../GenerativeUtils';

export class Simulation {


    agents : GenerativeAgent[] = [];
    utils : GenerativeAgentsUtils = new GenerativeAgentsUtils();

    constructor() {
        this.createAgent();
    }


    async createAgent() {
        console.log("Creating agent");
        let agent = new GenerativeAgent(this.utils);
        await agent.generateCharacter();
        this.agents.push(agent);
    }


    async simulate(observation : string) {

        this.agents.forEach(async (agent) => {
            await agent.simulate(observation);
        });

    }



}