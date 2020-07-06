'use strict';
const {Contract} = require('fabric-contract-api');

class MilkChain extends Contract {

    constructor(ctx){
        this.ctx  = ctx;
    }

    async initializeContract(ctx, issuer, loaner, borrower, contractId,deadLine) {
        const milkChain = {
            issuer,
            loaner,
            borrower,
            contractId,
            deadLine
        };

        await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(milkChain)));
    }

    async loanerStatusContract( noOfSheep, milkKg, contractId,status) {
            const milkChainAsBytes = await this.ctx.stub.getState(contractId);
            if(!milkChainAsBytes && milkChainAsBytes.lenght == 0 ) {
                throw new Error($`{contractId} does not exist`);
            }
        
            const milkChain = JSON.parse(milkChainAsBytes.toString());
            milkChain.loanerStatusContract = status;
            milkChain.noOfSheep = noOfSheep;
            milkChain.milkKg = milkKg;
            if(milkChain.loanerStatusContract == true){
                milkChain.ContractStatus = 'InNegotiation';
            } else {
                milkChain.ContractStatus = 'Failed';
            }

            await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(milkChain)));
    }

    async borrowerStatusContract( noOfSheep, milkKg, contractId,status) {
        const milkChainAsBytes = await this.ctx.stub.getState(contractId);
        if(!milkChainAsBytes && milkChainAsBytes.lenght == 0 ) {
            throw new Error($`{contractId} does not exist`);
        }
    
        const milkChain = JSON.parse(milkChainAsBytes.toString());
        if(milkChain.loanerStatusContract == false){
            throw new Error($`{contractId} loaner didn't accepted`);
        }

        milkChain.borrowerStatusContract = status;
        milkChain.noOfSheep = noOfSheep;
        milkChain.milkKg = milkKg;
        milkChain.isCollected = false;
        if(milkChain.borrowerStatusContract == true){
            milkChain.ContractStatus = 'Accepted';
        } else {
            milkChain.ContractStatus = 'Failed';
        }
        await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(milkChain)));
    }

    async diaryAcceptMilk( borrower,  milkReceived, dateOfReceiving) {
        const milkChainAsBytes = await this.ctx.stub.getState(contractId);
        if(!milkChainAsBytes && milkChainAsBytes.lenght == 0 ) {
            throw new Error($`{contractId} does not exist`);
        }
        const milkChain = JSON.parse(milkChainAsBytes.toString());

        if(milkChain.loanerStatusContract == false || milkChain.borrowerStatusContract == false){
            throw new Error($`{contractId} contract has been never activated`);
        }

        milkChain.milkReceived += milkReceived;
        milkChain.borrower = borrower;
        milkChain.dateOfReceiving = dateOfReceiving;
        
        if(milkChain.milkKg <= milkReceived)
        {
            milkChain.isCollected = true;
            milkChain.ContractStatus = 'Finished';
        }

        if(milkChain.deadLine > dateOfReceiving){
            milkChain.ContractStatus = 'Failed';
        }

        await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(milkChain)));

    }

}
module.exports = MilkChain;