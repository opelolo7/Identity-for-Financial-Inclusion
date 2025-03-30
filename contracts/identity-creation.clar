;; Identity Creation Contract
;; Establishes digital IDs for unbanked populations

(define-data-var next-id uint u0)

;; Data structure for identity
(define-map identities
  { id: uint }
  {
    owner: principal,
    created-at: uint,
    active: bool,
    metadata: (optional (string-utf8 256))
  }
)

;; Data structure to track owner to identity mapping
(define-map owner-to-identity
  { owner: principal }
  { id: uint }
)

;; Create a new identity
(define-public (create-identity (metadata (optional (string-utf8 256))))
  (let
    (
      (new-id (var-get next-id))
      (existing-id (map-get? owner-to-identity { owner: tx-sender }))
    )
    ;; Check if user already has an identity
    (asserts! (is-none existing-id) (err u1))

    ;; Create new identity
    (map-set identities
      { id: new-id }
      {
        owner: tx-sender,
        created-at: block-height,
        active: true,
        metadata: metadata
      }
    )

    ;; Track owner to identity mapping
    (map-set owner-to-identity
      { owner: tx-sender }
      { id: new-id }
    )

    ;; Increment ID counter
    (var-set next-id (+ new-id u1))

    (ok new-id)
  )
)

;; Get identity by ID
(define-read-only (get-identity (id uint))
  (map-get? identities { id: id })
)

;; Get identity by owner
(define-read-only (get-identity-by-owner (owner principal))
  (let ((id-map (map-get? owner-to-identity { owner: owner })))
    (if (is-some id-map)
      (get-identity (get id (unwrap-panic id-map)))
      none
    )
  )
)

;; Deactivate identity
(define-public (deactivate-identity (id uint))
  (let ((identity (get-identity id)))
    (asserts! (is-some identity) (err u2))
    (asserts! (is-eq (get owner (unwrap-panic identity)) tx-sender) (err u3))

    (map-set identities
      { id: id }
      (merge (unwrap-panic identity) { active: false })
    )

    (ok true)
  )
)

;; Reactivate identity
(define-public (reactivate-identity (id uint))
  (let ((identity (get-identity id)))
    (asserts! (is-some identity) (err u2))
    (asserts! (is-eq (get owner (unwrap-panic identity)) tx-sender) (err u3))

    (map-set identities
      { id: id }
      (merge (unwrap-panic identity) { active: true })
    )

    (ok true)
  )
)

;; Update identity metadata
(define-public (update-metadata (id uint) (metadata (optional (string-utf8 256))))
  (let ((identity (get-identity id)))
    (asserts! (is-some identity) (err u2))
    (asserts! (is-eq (get owner (unwrap-panic identity)) tx-sender) (err u3))

    (map-set identities
      { id: id }
      (merge (unwrap-panic identity) { metadata: metadata })
    )

    (ok true)
  )
)

