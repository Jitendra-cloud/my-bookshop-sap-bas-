module.exports = (srv) => {
// module.exports = srv_func => {
    // Reply mock data for Books............................................................................................
    // srv_func.on ('READ', 'Books', ()=>[
    //   { ID:202, title:'Wuthering Heights', author_ID:101, stock:12 },
    //   { ID:203, title:'The Raven', author_ID:150, stock:333 },
    //   { ID:204, title:'Eleonora', author_ID:150, stock:555 },
    //   { ID:205, title:'Catweazle', author_ID:170, stock:222 }, ])
    // Reply mock data for Authors..........................................................................................
    // srv_func.on ('READ', 'Authors', ()=>[
    //   { ID:102, name:'Emily Brontë' },
    //   { ID:150, name:'Edgar Allen Poe' },
    //   { ID:170, name:'Richard Carpenter' }, ])



        const { Books } = cds.entities('my.bookshop')

        // Reduce stock of ordered books
        srv.before('CREATE', 'Orders', async (req) => {
            const order = req.data
            if (!order.amount || order.amount <= 0) return req.error(400, 'Order at least 1 book')
            const tx = cds.transaction(req)
            const affectedRows = await tx.run(
                UPDATE(Books)
                    .set({ stock: { '-=': order.amount } })
                    .where({ stock: { '>=': order.amount },/*and*/ ID: order.book_ID })
            )
            if (affectedRows === 0) req.error(409, "Sold out, sorry")
        })

        // Add some discount for overstocked books
        srv.after('READ', 'Books', each => {
            if (each.stock > 111) each.title += ' -- 11% discount!'
        })

    } 