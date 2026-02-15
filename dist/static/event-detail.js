// Event detail page with ticket purchase

async function loadEventDetail() {
    try {
        const response = await axios.get(`/api/events/${eventSlug}`);
        const event = response.data;
        
        const container = document.getElementById('event-detail');
        
        let statusBadge = '';
        let statusColor = 'bg-gray-600';
        
        switch(event.status) {
            case 'upcoming':
                statusBadge = 'UPCOMING';
                statusColor = 'bg-blue-600';
                break;
            case 'live':
                statusBadge = 'LIVE NOW';
                statusColor = 'bg-red-600 animate-pulse';
                break;
            case 'ended':
                statusBadge = 'ENDED';
                statusColor = 'bg-gray-600';
                break;
            case 'archived':
                statusBadge = 'ARCHIVE';
                statusColor = 'bg-purple-600';
                break;
        }
        
        container.innerHTML = `
            <div class="bg-black bg-opacity-40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-800">
                <div class="aspect-video bg-gray-800 relative">
                    <img src="${event.thumbnail_url || 'https://via.placeholder.com/1200x675'}" 
                         alt="${event.title}" 
                         class="w-full h-full object-cover">
                    <div class="absolute top-4 right-4 ${statusColor} text-white px-4 py-2 rounded-full text-lg font-bold">
                        ${event.status === 'live' ? '<i class="fas fa-circle mr-2"></i>' : ''}
                        ${statusBadge}
                    </div>
                </div>
                
                <div class="p-6 md:p-8">
                    <h1 class="text-2xl md:text-4xl font-bold text-white mb-4">${event.title}</h1>
                    
                    <div class="flex items-center space-x-6 text-gray-300 mb-6">
                        ${event.start_time ? `
                            <div>
                                <i class="fas fa-calendar-alt mr-2 text-purple-500"></i>
                                ${new Date(event.start_time).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <div>
                                <i class="fas fa-clock mr-2 text-purple-500"></i>
                                ${new Date(event.start_time).toLocaleTimeString('ja-JP', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        ` : ''}
                        <div>
                            <i class="fas fa-${event.event_type === 'live' ? 'broadcast-tower' : 'archive'} mr-2 text-purple-500"></i>
                            ${event.event_type === 'live' ? 'ライブ配信' : 'アーカイブ配信'}
                        </div>
                    </div>
                    
                    ${event.description ? `
                        <div class="mb-8">
                            <h2 class="text-xl md:text-2xl font-bold text-white mb-3">イベント詳細</h2>
                            <p class="text-gray-300 whitespace-pre-line text-sm md:text-base">${event.description}</p>
                        </div>
                    ` : ''}
                    
                    <div class="border-t border-gray-700 pt-8">
                        <h2 class="text-xl md:text-2xl font-bold text-white mb-6">
                            <i class="fas fa-ticket-alt text-purple-500 mr-2"></i>
                            チケット選択
                        </h2>
                        
                        <div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/50 rounded-xl p-4 md:p-6 mb-6 backdrop-blur-sm shadow-lg">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div class="flex items-start space-x-3">
                                    <div class="bg-blue-500/20 rounded-full p-3 flex-shrink-0">
                                        <i class="fas fa-eye text-blue-400 text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-white font-bold mb-1 text-base md:text-lg">
                                            開発用プレビュー
                                        </h3>
                                        <p class="text-gray-300 text-xs md:text-sm leading-relaxed">
                                            チケット購入なしで動画プレイヤーをテストできます
                                        </p>
                                    </div>
                                </div>
                                <a href="/watch/${event.slug}?preview=true" 
                                   class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 whitespace-nowrap text-center shadow-md">
                                    <i class="fas fa-play mr-2"></i>
                                    プレビュー
                                </a>
                            </div>
                        </div>
                        
                        ${event.tickets && event.tickets.length > 0 ? `
                            <div class="grid md:grid-cols-2 gap-4">
                                ${event.tickets.filter(t => t.is_active).map(ticket => {
                                    const isSoldOut = ticket.stock !== null && ticket.sold_count >= ticket.stock;
                                    const stockText = ticket.stock !== null 
                                        ? `残り: ${Math.max(0, ticket.stock - ticket.sold_count)}枚`
                                        : '';
                                    
                                    return `
                                        <div class="bg-gray-900 bg-opacity-50 rounded-lg p-4 md:p-6 border ${isSoldOut ? 'border-gray-700 opacity-60' : 'border-purple-800 hover:border-purple-500'} transition">
                                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                                                <div>
                                                    <h3 class="text-lg md:text-xl font-bold text-white mb-1">${ticket.name}</h3>
                                                    ${ticket.description ? `<p class="text-gray-400 text-xs md:text-sm">${ticket.description}</p>` : ''}
                                                </div>
                                                ${isSoldOut ? '<span class="bg-red-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold self-start">完売</span>' : ''}
                                            </div>
                                            
                                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                                <div>
                                                    <div class="text-2xl md:text-3xl font-bold text-purple-400">
                                                        ¥${ticket.price.toLocaleString()}
                                                    </div>
                                                    ${stockText ? `<div class="text-xs md:text-sm text-gray-500 mt-1">${stockText}</div>` : ''}
                                                </div>
                                                
                                                ${!isSoldOut ? `
                                                    <button onclick="purchaseTicket(${event.id}, ${ticket.id})" 
                                                            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition w-full sm:w-auto">
                                                        <i class="fas fa-shopping-cart mr-2"></i>
                                                        購入する
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="text-center text-gray-400 py-8">
                                <i class="fas fa-ticket-alt text-4xl mb-2"></i>
                                <p>現在、販売中のチケットはありません</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load event:', error);
        document.getElementById('event-detail').innerHTML = `
            <div class="bg-red-900 bg-opacity-20 border border-red-800 rounded-xl p-8 text-center">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">エラー</h2>
                <p class="text-gray-300">イベント情報の読み込みに失敗しました</p>
                <a href="/events" class="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition">
                    イベント一覧に戻る
                </a>
            </div>
        `;
    }
}

async function purchaseTicket(eventId, ticketId) {
    try {
        // Show loading state
        event.target.disabled = true;
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>処理中...';
        
        // Create checkout session
        const response = await axios.post('/api/stripe/checkout', {
            eventId: eventId,
            ticketId: ticketId
        });
        
        // Redirect to Stripe Checkout
        if (response.data.url) {
            window.location.href = response.data.url;
        } else {
            throw new Error('No checkout URL returned');
        }
    } catch (error) {
        console.error('Purchase failed:', error);
        alert('チケット購入の処理に失敗しました。もう一度お試しください。');
        
        // Reset button state
        event.target.disabled = false;
        event.target.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i>購入する';
    }
}

// Load event detail on page load
loadEventDetail();
