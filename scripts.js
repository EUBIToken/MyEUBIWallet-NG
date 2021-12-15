'use strict';
{
	//Initialize Materialize
	M.AutoInit();

	//begin auto-generated modal bindings
	const InvalidAmountModalInstance = M.Modal.getInstance(InvalidAmountModal),SendFailModalInstance = M.Modal.getInstance(SendFailModal),SentModalInstance = M.Modal.getInstance(SentModal),SignFailModalInstance = M.Modal.getInstance(SignFailModal),WalletDeletedModalInstance = M.Modal.getInstance(WalletDeletedModal),WalletRenamedModalInstance = M.Modal.getInstance(WalletRenamedModal),DecryptionErrorModalInstance = M.Modal.getInstance(DecryptionErrorModal),WalletSavedModalInstance = M.Modal.getInstance(WalletSavedModal),MismatchingPasswordModalInstance = M.Modal.getInstance(MismatchingPasswordModal),InvalidKeyModalInstance = M.Modal.getInstance(InvalidKeyModal),SendEUBIModalInstance = M.Modal.getInstance(SendEUBIModal),NativeSendModalInstance = M.Modal.getInstance(NativeSendModal),deleteWalletModalInstance = M.Modal.getInstance(deleteWalletModal),PancakeModalInstance = M.Modal.getInstance(PancakeModal),PancakeApproveEUBIModalInstance = M.Modal.getInstance(PancakeApproveEUBIModal),PancakeApprovePRSSModalInstance = M.Modal.getInstance(PancakeApprovePRSSModal),PancakeAddLiquidityModalInstance = M.Modal.getInstance(PancakeAddLiquidityModal),InvalidAddressModalInstance = M.Modal.getInstance(InvalidAddressModal);
	//end auto-generated modal bindings

	//XSS Protector
	const escapeHtml = function(_0x4ed2cb) {
		const _0x4c4014 = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'\"': '&quot;',
			'\'': '&#039;'
		};
		return _0x4ed2cb['replace'](/[&<>"']/g, function(_0x3e5f57) {
			return _0x4c4014[_0x3e5f57];
		});
	};
	
	//Blockchain Manager
	const BlockchainManager = new Web3.modules.Eth('https://speedy-nodes-nyc.moralis.io/41590f438df3f8018a1e84b1/bsc/mainnet');
	
	//Token managers
	let erc20 = [{"inputs": [{"internalType": "address","name": "owner","type": "address"},{"internalType": "address","name": "spender","type": "address"}],"name": "allowance","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "approve","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "account","type": "address"}],"name": "balanceOf","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "recipient","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "transfer","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "sender","type": "address"},{"internalType": "address","name": "recipient","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "transferFrom","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"}];
	const bEUBI = new BlockchainManager.Contract(erc20, '0x27faaa5bd713dcd4258d5c49258fbef45314ae5d');
	const bPRSS = new BlockchainManager.Contract(erc20, '0x17e6d3E7B727b31Ab6eB9B5b0A38f00389589c80');
	//const bEUBI_LP = new BlockchainManager.Contract(erc20, '0x7700eea0633210437ffcc6b10c02e0515054b08f');
	erc20 = undefined;
	
	//EXPERIMENTAL: TRANSACTION HISTORY VIEWER
	let TXHistory = [];
	let TXHistoryOffset = 0;
	const reloadTransactionHistory = async function(shift){
		let temphtml = '';
		TXHistoryOffset += shift;
		if(TXHistoryOffset < 0){
			TXHistoryOffset = 0;
		}
		let c = 0;
		for(let i = TXHistoryOffset; i < TXHistory.length; i++){
			const current = TXHistory[i];
			if(current.gasUsed == '21000'){
				if(current.from == address){
					if(current.to != address){
						temphtml += '<p>You => ' + escapeHtml(current.to) + ' ' + Web3.utils.fromWei(current.value) + ' BNB @ ' + new Date(parseInt(current.timeStamp) * 1000).toString() + '</p>';
					}
				} else {
					temphtml += '<p>' + escapeHtml(current.to) + ' => You' + ' ' + Web3.utils.fromWei(current.value) + ' BNB @ ' + new Date(parseInt(current.timeStamp) * 1000).toString() + '</p>';
				}
				if(c++ == 9){
					break;
				}
			}
		}
		if(c == 0){
			TXHistoryOffset -= shift;
		} else{
			transactionHistory.innerHTML = temphtml;
		}
		
	};
	previousTransactionHistoryButton.onclick = function(){
		reloadTransactionHistory(-10);
	};
	nextTransactionHistoryButton.onclick = function(){
		reloadTransactionHistory(10);
	};
	
	//Account Manager
	let address = undefined;
	const reloadWallet = async function(){
		//Reset fields
		eubiBalance.innerHTML = 'Fetching bEUBI balance...';
		prssBalance.innerHTML = 'Fetching bPRSS balance...';
		nativeBalance.innerHTML = 'Fetching BNB balance...';
		
		//Batch load balances
		const batch = new BlockchainManager.BatchRequest();
		const updateTokenBalance = function(target, contract, name){
			batch.add(contract.methods.balanceOf(address).call.request(async function(fail, pass){
				if(pass){
					target.innerHTML = escapeHtml(Web3.utils.fromWei(pass)) + ' ' + name;
				} else{
					target.innerHTML = 'unable to fetch ' + name + ' balance!';
				}
			}));
		};
		
		batch.add(BlockchainManager.getBalance.request(address, async function(fail, pass){
			if(pass){
				nativeBalance.innerHTML = escapeHtml(Web3.utils.fromWei(pass)) + ' BNB';
			} else{
				nativeBalance.innerHTML = 'unable to fetch BNB balance!';
			}
		}));
		
		updateTokenBalance(eubiBalance, bEUBI, 'bEUBI');
		updateTokenBalance(prssBalance, bPRSS, 'bPRSS');
		batch.execute();
		
		//EXPERIMENTAL: TRANSACTION HISTORY VIEWER
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = async function() {
			if (this.readyState == 4 && this.status == 200) {
			    const res = JSON.parse(xhttp.responseText);
			    if(res == undefined){
					return;
			    }
			    if(res.result == undefined){
					return;
				}
				TXHistory = res.result;
				reloadTransactionHistory(0);
			}
		};
		xhttp.open("GET", "https://api.bscscan.com/api?module=account&action=txlist&startblock=0&sort=asc&address=" + address, true);
		xhttp.send();
		
		
	};
	let tempSignAndSendTransaction = undefined;
	{
		let AccountManager = undefined;
		const loadAccountManager = async function(account){
			AccountManager = account;
			address = account.address;
			beforeWalletLoad.style.display = 'none';
			toggle('hideInReadOnly', 'list-item');
			afterWalletLoad.style.display = 'block';
			walletAddress2.innerHTML = escapeHtml(account.address);
			reloadWallet();
		};
		const unloadAccountManager = async function(){
			AccountManager = undefined;
			address = undefined;
			beforeWalletLoad.style.display = 'block';
			afterWalletLoad.style.display = 'none';
		};
		createWalletButton.onclick = function(){
			loadAccountManager(BlockchainManager.accounts.create());
		};
		unloadWalletButton.onclick = unloadAccountManager;
		
		//Import private key
		keyloader.onclick = function(){
			try{
				loadAccountManager(BlockchainManager.accounts.privateKeyToAccount(privateKey.value));
			} catch{
				InvalidKeyModalInstance.open();
			}
		};
		
		//Quick wallet access operations
		{
			//Load quick wallet access
			let SerializedQuickWalletAccess = localStorage.getItem('MyEUBIWallet_QuickWalletAccess');
			if(SerializedQuickWalletAccess == null){
				SerializedQuickWalletAccess = '[]';
			}
			const QuickWalletAccess = JSON.parse(SerializedQuickWalletAccess);
			SerializedQuickWalletAccess = undefined;
			
			//Quick wallet access - reload wallets
			const reloadQuickWalletAccess = async function(){
				let temphtml = '<h6><label><input name="quickWalletSelector2" id="quickWalletSelectorButton0" type="radio" checked/><span>';
				for(let i = 0; i < QuickWalletAccess.length; i++){
					if(i != 0){
						temphtml += '<h6><label><input name="quickWalletSelector2" type="radio" id="quickWalletSelectorButton' + i.toString() + '" /><span>';
					}
					temphtml += escapeHtml(QuickWalletAccess[i].name) + '</span></label></h6>';
				}
				if(temphtml == '<h6><label><input name="quickWalletSelector2" id="quickWalletSelectorButton0" type="radio" checked/><span>'){
					listofwallets2.innerHTML = '<h6>You have no wallets stored in browser storage!</h6>';
				} else{
					listofwallets2.innerHTML = temphtml;
				}
			};
			
			//Quick wallet access - add wallet
			AddQuickWalletAccess.onclick = async function(){
				const plainpassword2 = pass1.value;
				if(plainpassword2 != pass2.value){
					MismatchingPasswordModalInstance.open();
					return;
				}
				const temp3 = AccountManager.encrypt(plainpassword2);
				temp3.name = storedWalletName.value;
				QuickWalletAccess.push(temp3);
				localStorage.setItem('MyEUBIWallet_QuickWalletAccess', JSON.stringify(QuickWalletAccess));
				reloadQuickWalletAccess();
				WalletSavedModalInstance.open();
			};
			
			//Quick wallet access - load wallet
			quickLoadWallet.onclick = async function(){
				for(let i = 0; i < QuickWalletAccess.length; i++){
					if(document.getElementById('quickWalletSelectorButton' + i.toString())?.checked){
						//Begin wallet load sequence
						let decrypted = undefined;
						try{
							decrypted = BlockchainManager.accounts.decrypt(QuickWalletAccess[i], pass3.value);
						} catch{
							DecryptionErrorModal.open();
						}
						if(decrypted){
							loadAccountManager(decrypted);
						}
						break;
					}
				}
			};
			
			//Quick wallet access - rename wallet
			quickRenameWallet.onclick = async function(){
				for(let i = 0; i < QuickWalletAccess.length; i++){
					if(document.getElementById('quickWalletSelectorButton' + i.toString())?.checked){
						QuickWalletAccess[i].name = storedWalletName2.value;
						localStorage.setItem('MyEUBIWallet_QuickWalletAccess', JSON.stringify(QuickWalletAccess));
						reloadQuickWalletAccess();
						WalletRenamedModalInstance.open();
						break;
					}
				}
			};
			//Quick wallet access - delete wallet
			quickDeleteWallet.onclick = async function(){
				for(let i = 0; i < QuickWalletAccess.length; i++){
					if(document.getElementById('quickWalletSelectorButton' + i.toString())?.checked){
						QuickWalletAccess.splice(i, 1);
						localStorage.setItem('MyEUBIWallet_QuickWalletAccess', JSON.stringify(QuickWalletAccess));
						reloadQuickWalletAccess();
						WalletDeletedModalInstance.open();
						break;
					}
				}
			};
			quickDeleteWallet2.onclick = function(){
				deleteWalletModalInstance.open();
			};
			
			//Wallet exporter
			quickExportWallet.onclick = async function() {
				for(let i = 0; i < QuickWalletAccess.length; i++){
					if(document.getElementById('quickWalletSelectorButton' + i.toString())?.checked){
						const exportingWallet = {};
						Object.assign(exportingWallet, QuickWalletAccess[i]);
						exportingWallet.name = undefined;
						const element = document.createElement('a');
						element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportingWallet)));
						element.setAttribute('download', 'keystore.json');
						element.style.display = 'none';
						document.body.appendChild(element);
						element.click();
						document.body.removeChild(element);
						console.log(QuickWalletAccess[i]);
					}
				}
			};
			
			//Initially load quick wallet access
			reloadQuickWalletAccess();
		}
		
		//Last function of the day
		tempSignAndSendTransaction = async function(transaction){
			transaction.chainId = '56';
			transaction.from = address;
			transaction;
			let ix = 0;
			const batch = new BlockchainManager.BatchRequest();
			const quicksend = function(){
				if(ix++ == 2){
					transaction.from = undefined;
					//Despite this being "unfailable", we still need failure checks
					//Since it's a cybersecurity best practice
					AccountManager.signTransaction(transaction).then(function(value){
						BlockchainManager.sendSignedTransaction(value.rawTransaction).then(function(pass){
							SentModalInstance.open();
							reloadWallet();
						}, function(){
							SendFailModal.open();
							reloadWallet();
						});
					}, function(fail){
						SignFailModalInstance.open();
					});
				}
			};
			batch.add(BlockchainManager.estimateGas.request(transaction, async function(fail, pass){
				if(pass){
					transaction.gas = pass.toString();
				} else{
					transaction.gas = '21000';
				}
				quicksend();
			}));
			batch.add(BlockchainManager.getGasPrice.request(async function(fail, pass){
				if(pass){
					transaction.gasPrice = pass;
					quicksend();
				} else{
					SignFailModalInstance.open();
				}
			}));
			batch.add(BlockchainManager.getTransactionCount.request(address, async function(fail, pass){
				if(pass){
					transaction.nonce = pass;
					quicksend();
				} else{
					SignFailModalInstance.open();
				}
			}));
			batch.execute();
		};
	}
	
	//Service Manager
	{
		const signAndSendTransaction = tempSignAndSendTransaction;
		//Cryptocurrency sending
		sendNativeButton2.onclick = function(){
			let transaction = {};
			let value;
			try{
				value = Web3.utils.toWei(NativeAmount.value);
			} catch{
				InvalidAmountModalInstance.open();
				return;
			}
			const adr2 = sendtoNative.value;
			if(Web3.utils.isAddress(adr2)){
				let contract_addr = sendingCryptoSelector.value;
				if(contract_addr == 'bnb'){
					//Sending BNB
					transaction.to = adr2;
					transaction.value = value;
				} else{
					//Sending tokens
					transaction.to = contract_addr;
					transaction.data = bEUBI.methods.transfer(adr2, value).encodeABI();
				}
				signAndSendTransaction(transaction);
			} else{
				InvalidAddressModalInstance.open();
			}
		};
		sendNativeButton.onclick = function(){
			NativeSendModalInstance.open();
		};
	}
	
	//dereference temporary send function
	tempSignAndSendTransaction = undefined;
	
	//miscy
	const toggle = async function (className, displayState){
		var elements = document.getElementsByClassName(className)

		for (var i = 0; i < elements.length; i++){
			elements[i].style.display = displayState;
		}
	}
	
	//Latest possible bindings
	reloadWalletButton.onclick = reloadWallet;
	loadViewOnly.onclick = function(){
		const addr2 = walletAddress.value;
		if(Web3.utils.isAddress(addr2)){
			address = addr2;
			beforeWalletLoad.style.display = 'none';
			toggle('hideInReadOnly', 'none');
			afterWalletLoad.style.display = 'block';
			reloadWallet();
		} else{
			InvalidAddressModalInstance.open();
		}
	};
	copyAddressButton.onclick = function(){
		navigator.clipboard.writeText(address);
	};
	
	//Disable undefined buttons
	{
		const tempbtns = document.getElementsByTagName('button');
		for(let i = 0; i < tempbtns.length; i++){
			const temp2 = tempbtns[i];
			if(temp2.onclick == undefined){
				temp2.disabled = true;
			}
		}
	}
}

//Only used during development
const generateModalBindings = function(){
	const temp = document.getElementsByClassName('modal');
	let str = 'const ';
	for(let i = 0; i < temp.length; i++){
		const temp2 = temp[i];
		if(temp2.id && (temp2.id != '')){
			if(str != 'const '){
				str += ',';
			}
			str += temp2.id + 'Instance = M.Modal.getInstance(' + temp2.id + ')';
		}
	}
	return str + ';';
};
